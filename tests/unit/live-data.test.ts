// בדיקות לנתוני אמת (שלב 5), בלי אינטרנט: בניית הבקשה, תרגום התשובה, המשימה המתוזמנת והגשת התחזית.
import { describe, expect, it } from 'vitest';
import { buildRequestUrl, SOURCES, toForecastFile, DAILY_CALL_LIMIT } from '../../scripts/fetcher/openMeteo';
import { runFetch } from '../../scripts/fetcher/worker';
import { serveForecast } from '../../functions/data/[file]';
import { normalizeForecastFile } from '../../src/engine/normalize';
import { buildBeachForecast } from '../../src/engine/forecastView';
import { getRecommendation } from '../../src/engine/recommend';
import { countCall } from '../../server/forecast/store';
import { createTestD1 } from '../helpers/d1-shim';
import { marineResponse, weatherResponse } from '../helpers/openMeteoFixtures';

const NOW = new Date('2026-11-13T10:30:00Z'); // 12:30 שעון ישראל
const DATE = '2026-11-13';
const weather = SOURCES.find((s) => s.id === 'open-meteo-weather')!;
const marine = SOURCES.find((s) => s.id === 'open-meteo-marine')!;
const responses = () => ({ 'open-meteo-weather': weatherResponse(DATE), 'open-meteo-marine': marineResponse(DATE) });

describe('בניית הבקשה', () => {
  it('בקשה אחת לכל 7 החופים, עם המשתנים מקובץ ההגדרות ושעון ישראל', () => {
    const url = new URL(buildRequestUrl(weather));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')!.split(',')).toHaveLength(7);
    expect(url.searchParams.get('hourly')).toBe('temperature_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,uv_index');
    expect(url.searchParams.get('timezone')).toBe('Asia/Jerusalem');
    expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
    expect(url.search).not.toMatch(/key|token/i);
  });
  it('הגלים נמשכים מנקודה בים, לא מקו החוף', () => {
    const lng = new URL(buildRequestUrl(marine)).searchParams.get('longitude')!.split(',').map(Number);
    expect(lng[0]).toBeLessThan(34.7663); // גורדון: מערבה מהחוף
  });
});

describe('תרגום התשובה לחוזה שלנו', () => {
  it('הקובץ עובר את בדיקת החוזה, מסומן live, עם 48 שעות לכל חוף', () => {
    const data = normalizeForecastFile(toForecastFile(responses(), NOW))!;
    expect(data.dataMode).toBe('live');
    expect(data.generatedAt).toBe(NOW.toISOString());
    expect(Object.keys(data.series)).toHaveLength(7);
    expect(data.series.gordon).toHaveLength(48);
    expect(data.series.gordon[14].validAt).toBe('2026-11-13T14:00:00+02:00');
    expect(data.series.gordon[14].fields.windDirection).toMatchObject({ value: 280, unit: 'deg', source: 'open-meteo-weather' });
    expect(data.series.gordon[14].fields.waterTemperature).toMatchObject({ value: 23.4, source: 'open-meteo-marine' });
  });
  it('ערך חסר מהמקור נשאר null', () => {
    const data = normalizeForecastFile(toForecastFile(responses(), NOW))!;
    expect(data.series.eilat[0].fields.waveHeight.value).toBeNull();
    expect(data.series.eilat[5].fields.waveHeight.value).not.toBeNull();
  });
  it('יחידה לא צפויה (למשל רוח במטר לשנייה): הערך null, לא המרה מנוחשת', () => {
    const w = weatherResponse(DATE);
    w.forEach((loc) => (loc.hourly_units.wind_speed_10m = 'm/s'));
    const data = normalizeForecastFile(toForecastFile({ ...responses(), 'open-meteo-weather': w }, NOW))!;
    expect(data.series.gordon[12].fields.windSpeed.value).toBeNull();
    expect(data.series.gordon[12].fields.airTemperature.value).not.toBeNull();
  });
  it('מקור הים נכשל: הגלים null, מזג האוויר נשמר, והמנוע מחזיר "אין מספיק מידע" לשחייה', () => {
    const file = toForecastFile({ 'open-meteo-weather': weatherResponse(DATE) }, NOW);
    const data = normalizeForecastFile(file)!;
    expect(data.series.gordon[12].fields.waveHeight.value).toBeNull();
    expect(data.series.gordon[12].fields.airTemperature.value).not.toBeNull();
    expect(getRecommendation(buildBeachForecast(data.series.gordon, 'live', NOW), 'swim')).toBeNull();
  });
  it('שני המקורות נכשלו: לא נוצר קובץ', () => {
    expect(() => toForecastFile({}, NOW)).toThrow();
  });
});

describe('הכרטיס בנתוני אמת: היום הנכון והשעה הנכונה', () => {
  const data = normalizeForecastFile(toForecastFile(responses(), NOW))!;
  it('בוחר את 12:00 של היום, לא של מחר', () => {
    const f = buildBeachForecast(data.series.gordon, 'live', NOW);
    expect(f.currentTime).toBe('12:00');
    expect(f.hourlyForecast).toHaveLength(24);
  });
  it('אחרי חצות לוקח את שעות היום החדש מאותו קובץ', () => {
    const f = buildBeachForecast(data.series.gordon, 'live', new Date('2026-11-13T23:30:00Z')); // 01:30 ב-14.11
    expect(f.currentTime).toBe('01:00');
    expect(f.hourlyForecast[0].time).toBe('00:00');
  });
  it('קובץ ישן מיומיים: אין שעות להיום, ולכן אין ציון', () => {
    const f = buildBeachForecast(data.series.gordon, 'live', new Date('2026-11-16T10:00:00Z'));
    expect(f.currentTime).toBeNull();
    expect(getRecommendation(f, 'beach')).toBeNull();
  });
});

describe('המשימה המתוזמנת', () => {
  const okFetch = (urls: string[]) => async (url: string) => {
    urls.push(url);
    const body = url.includes('marine') ? marineResponse(DATE) : weatherResponse(DATE);
    return new Response(JSON.stringify(body), { status: 200 });
  };
  it('מושכת, סופרת 2 קריאות ושומרת עותק', async () => {
    const db = createTestD1();
    const urls: string[] = [];
    expect(await runFetch(db, okFetch(urls), NOW)).toEqual({ status: 'saved', calls: 2 });
    expect(urls).toHaveLength(2);
    expect(urls.every((u) => u.startsWith('https://api.open-meteo.com/') || u.startsWith('https://marine-api.open-meteo.com/'))).toBe(true);
    const row = db.raw.prepare('SELECT COUNT(*) AS n FROM forecast_snapshots').get() as { n: number };
    expect(row.n).toBe(1);
  });
  it('בלם קשיח: קרוב למגבלה היומית לא מושכים בכלל', async () => {
    const db = createTestD1();
    for (let i = 0; i < DAILY_CALL_LIMIT - 1; i++) await countCall(db, '2026-11-13');
    const urls: string[] = [];
    expect((await runFetch(db, okFetch(urls), NOW)).status).toBe('skipped_limit');
    expect(urls).toHaveLength(0);
  });
  it('שגיאת רשת: הקריאות נספרות, ושום עותק לא נשמר', async () => {
    const db = createTestD1();
    const outcome = await runFetch(db, async () => { throw new Error('network down'); }, NOW);
    expect(outcome.status).toBe('failed');
    expect(outcome.calls).toBe(2);
    expect((db.raw.prepare('SELECT COUNT(*) AS n FROM forecast_snapshots').get() as { n: number }).n).toBe(0);
  });
  it('שומרת רק את 8 העותקים האחרונים', async () => {
    const db = createTestD1();
    for (let i = 0; i < 10; i++) await runFetch(db, okFetch([]), new Date(NOW.getTime() + i * 3 * 3_600_000));
    expect((db.raw.prepare('SELECT COUNT(*) AS n FROM forecast_snapshots').get() as { n: number }).n).toBe(8);
  });
});

describe('הגשת התחזית באתר (/data/forecast.json)', () => {
  const next = async () => new Response('static-mock', { status: 200 });
  it('לא במצב live: ממשיך לקובץ הדוגמה', async () => {
    const res = await serveForecast({ params: { file: 'forecast.json' }, env: { DB: createTestD1() }, next }, NOW.getTime());
    expect(await res.text()).toBe('static-mock');
  });
  it('במצב live: מחזיר את העותק האחרון', async () => {
    const db = createTestD1();
    await runFetch(db, async (url: string) => new Response(JSON.stringify(url.includes('marine') ? marineResponse(DATE) : weatherResponse(DATE))), NOW);
    const res = await serveForecast({ params: { file: 'forecast.json' }, env: { DB: db, FORECAST_MODE: 'live' }, next }, NOW.getTime() + 3_600_000);
    expect(res.status).toBe(200);
    expect((await res.json()).dataMode).toBe('live');
  });
  it('במצב live, עותק ישן מ-7 שעות או חסר: "לא זמין" (503), לא המלצה ישנה', async () => {
    const db = createTestD1();
    expect((await serveForecast({ params: { file: 'forecast.json' }, env: { DB: db, FORECAST_MODE: 'live' }, next }, NOW.getTime())).status).toBe(503);
    await runFetch(db, async (url: string) => new Response(JSON.stringify(url.includes('marine') ? marineResponse(DATE) : weatherResponse(DATE))), NOW);
    const stale = await serveForecast({ params: { file: 'forecast.json' }, env: { DB: db, FORECAST_MODE: 'live' }, next }, NOW.getTime() + 8 * 3_600_000);
    expect(stale.status).toBe(503);
  });
});

describe('שער הנתונים בצד האתר', () => {
  it('תחזית אמת ישנה מ-7 שעות נחשבת "לא זמינה", גם אם הגיעה מעותק שמור במכשיר', async () => {
    const { isTooOld } = await import('../../src/engine/dataGateway');
    const t = NOW.getTime();
    expect(isTooOld(NOW.toISOString(), t + 6 * 3_600_000)).toBe(false);
    expect(isTooOld(NOW.toISOString(), t + 8 * 3_600_000)).toBe(true);
    expect(isTooOld(null, t)).toBe(true);
  });
});
