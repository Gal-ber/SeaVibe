// בדיקות לבניית התחזית: הכרטיס מקבל את השורה של השעה הנוכחית, ונתון חסר לא הופך לציון.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizeForecastFile } from '../../src/engine/normalize';
import { buildBeachForecast, israelHour } from '../../src/engine/forecastView';
import { getRecommendation } from '../../src/lib/scoringEngine';

const data = normalizeForecastFile(JSON.parse(readFileSync('public/data/forecast.json', 'utf8')))!;
const summerNoonIsrael = new Date('2026-07-01T09:30:00Z'); // 12:30 שעון ישראל (קיץ, UTC+3)
const winterNoonIsrael = new Date('2026-01-15T10:30:00Z'); // 12:30 שעון ישראל (חורף, UTC+2)

describe('השעה הנוכחית', () => {
  it('לפי שעון ישראל, בקיץ ובחורף', () => {
    expect(israelHour(summerNoonIsrael)).toBe('12:00');
    expect(israelHour(winterNoonIsrael)).toBe('12:00');
    expect(israelHour(new Date('2026-07-01T21:05:00Z'))).toBe('00:00');
  });
});

describe('buildBeachForecast', () => {
  it('ערכי הכרטיס שווים בדיוק לשורה של השעה הנוכחית בטבלה', () => {
    for (const id of Object.keys(data.series)) {
      const forecast = buildBeachForecast(data.series[id], 'mock', summerNoonIsrael);
      const row = forecast.hourlyForecast.find((h) => h.time === '12:00')!;
      expect(forecast.currentTime).toBe('12:00');
      expect(forecast.waveHeight).toBe(row.waveHeight);
      expect(forecast.windSpeed).toBe(row.windSpeed);
      expect(forecast.temperature).toBe(row.airTemperature);
      expect(forecast.waterTemp).toBe(row.waterTemperature);
      expect(forecast.windAnalysis?.speed).toBe(row.windSpeed);
    }
  });
  it('טמפ׳ המים באילת חסרה, ומוצגת null ולא 0', () => {
    const eilat = buildBeachForecast(data.series.eilat, 'mock', summerNoonIsrael);
    expect(eilat.waterTemp).toBeNull();
  });
  it('חוף בלי נתונים מקבל תחזית ריקה, בלי ערכים מומצאים', () => {
    const empty = buildBeachForecast(undefined, 'mock', summerNoonIsrael);
    expect(empty.waveHeight).toBeNull();
    expect(empty.hourlyForecast).toEqual([]);
  });
  it('מגמת רוח נגזרת מהנתונים: בגורדון הרוח מתחזקת אחרי הבוקר', () => {
    const morning = new Date('2026-07-01T05:00:00Z'); // 08:00 שעון ישראל
    expect(buildBeachForecast(data.series.gordon, 'mock', morning).windAnalysis?.trend).toBe('stronger');
  });
});

describe('getRecommendation עם נתונים חסרים', () => {
  const base = buildBeachForecast(data.series.gordon, 'mock', summerNoonIsrael);
  it('חסר גובה גלים: אין ציון (אין מספיק מידע)', () => {
    expect(getRecommendation({ ...base, waveHeight: null }, 'swim')).toBeNull();
  });
  it('חסרה רוח או טמפ׳ אוויר: אין ציון', () => {
    expect(getRecommendation({ ...base, windSpeed: null }, 'sup')).toBeNull();
    expect(getRecommendation({ ...base, temperature: null }, 'beach')).toBeNull();
  });
  it('חסר UV: יש ציון, אבל UV לא מוצג כגורם', () => {
    const rec = getRecommendation({ ...base, uvIndex: null }, 'beach')!;
    expect(rec.score).toBeGreaterThanOrEqual(0);
    expect(rec.positiveFactors.join()).not.toContain('קרינה');
    expect(rec.negativeFactors.join()).not.toContain('UV');
  });
  it('חסר סיכוי גשם: לא נכתב "אין סיכוי לגשם"', () => {
    const rec = getRecommendation({ ...base, precipitationChance: null }, 'beach')!;
    expect(rec.positiveFactors.join()).not.toContain('גשם');
  });
});
