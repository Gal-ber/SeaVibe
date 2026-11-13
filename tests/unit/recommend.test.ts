// בדיקות להמלצה המלאה: הסבר מבוסס כללים, חלון זמן רציף, והחלפת פעילות שמשנה הכול.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizeForecastFile } from '../../src/engine/normalize';
import { buildBeachForecast } from '../../src/engine/forecastView';
import { getRecommendation, hourlyScores } from '../../src/engine/recommend';
import { findBestWindow } from '../../src/engine/timeWindow';

const data = normalizeForecastFile(JSON.parse(readFileSync('public/data/forecast.json', 'utf8')))!;
const morning = new Date('2026-07-01T05:30:00Z'); // 08:30 שעון ישראל
const gordon = buildBeachForecast(data.series.gordon, 'mock', morning);

describe('findBestWindow', () => {
  const series = (scores: (number | null)[]) => scores.map((score, h) => ({ time: `${String(h).padStart(2, '0')}:00`, score }));
  it('בוחר את הרצף עם הממוצע הגבוה ביותר, באורך 2–3 שעות', () => {
    const s = Array<number | null>(24).fill(40);
    s[9] = 70; s[10] = 90; s[11] = 90; s[12] = 90; s[13] = 70;
    expect(findBestWindow(series(s), '06:00')).toMatchObject({ start: '10:00', end: '13:00' });
  });
  it('אין רצף מעל הסף: אין חלון', () => {
    expect(findBestWindow(series(Array(24).fill(50)), '06:00')).toBeNull();
  });
  it('שעה בודדת טובה לא מספיקה לחלון', () => {
    const s = Array<number | null>(24).fill(30);
    s[10] = 95;
    expect(findBestWindow(series(s), '06:00')).toBeNull();
  });
  it('שעה חסרה (null) שוברת את הרצף', () => {
    const s = Array<number | null>(24).fill(30);
    s[10] = 90; s[11] = null; s[12] = 90;
    expect(findBestWindow(series(s), '06:00')).toBeNull();
  });
  it('לא מציע חלון שכבר עבר', () => {
    const s = Array<number | null>(24).fill(30);
    s[7] = 90; s[8] = 90; s[15] = 80; s[16] = 80;
    expect(findBestWindow(series(s), '12:00')).toMatchObject({ start: '15:00', end: '17:00' });
  });
});

describe('getRecommendation', () => {
  it('החלפת פעילות משנה ציון, כותרת, הסבר, חלון וציוני הטבלה', () => {
    const swim = getRecommendation(gordon, 'swim')!;
    const surf = getRecommendation(gordon, 'surf')!;
    expect(surf.score).not.toBe(swim.score);
    expect(surf.headline).not.toBe(swim.headline);
    expect(surf.shortExplanation).not.toBe(swim.shortExplanation);
    expect(surf.bestTimeWindow).not.toBe(swim.bestTimeWindow);
    expect(hourlyScores(gordon, 'surf')).not.toEqual(hourlyScores(gordon, 'swim'));
  });
  it('גלישה בגורדון (גלים 0.3 מ׳): ההסבר אומר שהגלים נמוכים מדי', () => {
    const surf = getRecommendation(gordon, 'surf')!;
    expect(surf.status).toBe('poor');
    expect(surf.negativeFactors[0]).toContain('הגלים נמוכים מדי');
    // אחרי 13:00 הגלים עולים ל-0.4 מ׳ (סביר), ולכן יש חלון אחר הצהריים
    expect(surf.bestTimeWindow).toBe('13:00–16:00');
  });
  it('גורם מופיע בהסבר רק אם הפעילות בודקת אותו', () => {
    const sup = getRecommendation(gordon, 'sup')!;
    const all = [...sup.positiveFactors, ...sup.negativeFactors].join(' ');
    expect(all).not.toContain('טמפרטורה');
    expect(all).not.toContain('המים');
  });
  it('באילת טמפ׳ המים חסרה: המלצת שחייה חלקית, עם הערה', () => {
    const eilat = buildBeachForecast(data.series.eilat, 'mock', morning);
    const swim = getRecommendation(eilat, 'swim')!;
    expect(swim.confidence).toBe('partial');
    expect(swim.negativeFactors.join(' ')).toContain('טמפ׳ המים לא זמינה');
  });
  it('בלי שעה נוכחית אין המלצה', () => {
    expect(getRecommendation({ ...gordon, currentTime: null }, 'swim')).toBeNull();
  });
});
