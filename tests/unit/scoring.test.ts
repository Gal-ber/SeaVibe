// טבלת מקרי בדיקה למנוע הציון: לכל אחת מ-6 הפעילויות, ערכים ידועים והציון הצפוי.
// אם משנים ספים ב-config/scoring.json, חלק מהבדיקות כאן ישתנו בכוונה. מעדכנים אותן יחד.
import { describe, expect, it } from 'vitest';
import { rateValue, scoreHour, statusFor } from '../../src/engine/scoring';
import { SCORING, SCORED_PARAMS } from '../../src/engine/scoringConfig';
import { HourlyForecast, ActivityId } from '../../src/types';

const hour = (v: Partial<HourlyForecast>): HourlyForecast => ({
  time: '12:00', airTemperature: 25, waterTemperature: 24, windSpeed: 10, windDirection: 'מערבית',
  waveHeight: 0.3, wavePeriod: 5, uvIndex: 5, precipitationChance: 0, ...v,
});

type Case = [ActivityId, string, Partial<HourlyForecast>, number | null, string | null];
const CASES: Case[] = [
  ['beach', 'הכול נוח', { airTemperature: 25, windSpeed: 10, waveHeight: 0.3 }, 100, 'excellent'],
  ['beach', 'קצת חם (סביר)', { airTemperature: 30 }, 84, 'good'],
  ['beach', 'רוח חזקה מדי: תקרה', { windSpeed: 30 }, 34, 'poor'],
  ['beach', 'גשם: מינוס 20', { precipitationChance: 60 }, 80, 'good'],
  ['swim', 'הכול נוח', { waveHeight: 0.3, windSpeed: 10, waterTemperature: 24, airTemperature: 28 }, 100, 'excellent'],
  ['swim', 'גלים גבוהים מדי: תקרה', { waveHeight: 1.0 }, 34, 'poor'],
  ['swim', 'מים קרירים (סביר)', { waterTemperature: 20 }, 90, 'excellent'],
  ['swim', 'חסר גובה גלים: אין ציון', { waveHeight: null }, null, null],
  ['kids', 'גלים 0.4 (סביר)', { waveHeight: 0.4 }, 84, 'good'],
  ['kids', 'רוח 20: לא נוח, אבל משקל 25% (בלי תקרה)', { windSpeed: 20 }, 79, 'good'],
  ['kids', 'גלים 0.7: תקרה', { waveHeight: 0.7 }, 34, 'poor'],
  ['surf', 'גלים 1 מ׳, רוח חלשה', { waveHeight: 1.0, windSpeed: 10 }, 100, 'excellent'],
  ['surf', 'גלים 0.5 (סביר, נמוך)', { waveHeight: 0.5, windSpeed: 10 }, 74, 'good'],
  ['surf', 'ים שטוח: תקרה', { waveHeight: 0.2 }, 34, 'poor'],
  ['sup', 'רוח 5, גלים 0.1', { windSpeed: 5, waveHeight: 0.1 }, 100, 'excellent'],
  ['sup', 'רוח 12 (סביר)', { windSpeed: 12, waveHeight: 0.1 }, 78, 'good'],
  ['sup', 'רוח 20: תקרה', { windSpeed: 20, waveHeight: 0.1 }, 34, 'poor'],
  ['sail', 'רוח 15, גלים 0.5', { windSpeed: 15, waveHeight: 0.5 }, 100, 'excellent'],
  ['sail', 'רוח 8 (סביר, חלשה)', { windSpeed: 8, waveHeight: 0.5 }, 76, 'good'],
  ['sail', 'רוח 3: חלשה מדי, תקרה', { windSpeed: 3, waveHeight: 0.5 }, 34, 'poor'],
];

describe('טבלת מקרי בדיקה לכל פעילות', () => {
  it.each(CASES)('%s: %s', (activity, _name, values, score, status) => {
    const result = scoreHour(hour(values), activity);
    expect(result.score).toBe(score);
    expect(result.status).toBe(status);
  });
});

describe('נתונים חסרים', () => {
  it('נתון פחות חשוב חסר (מים בשחייה): יש ציון, והוא מסומן כחסר', () => {
    const result = scoreHour(hour({ waterTemperature: null }), 'swim');
    expect(result.score).toBe(100);
    expect(result.missing).toEqual(['waterTemperature']);
  });
  it('נתון חשוב חסר (רוח ב-SUP): אין ציון', () => {
    expect(scoreHour(hour({ windSpeed: null }), 'sup').score).toBeNull();
  });
  it('נתון שהפעילות לא בודקת (מים בגלישה) לא משנה כלום', () => {
    expect(scoreHour(hour({ waterTemperature: null, waveHeight: 1 }), 'surf').missing).toEqual([]);
  });
});

describe('דירוג ומדרגות', () => {
  const surfWaves = SCORING.activities.surf.waveHeight!;
  it('דירוג עם כיוון: נמוך או גבוה', () => {
    expect(rateValue(1.0, surfWaves)).toEqual({ rating: 'comfortable', side: null });
    expect(rateValue(0.5, surfWaves)).toEqual({ rating: 'acceptable', side: 'low' });
    expect(rateValue(1.8, surfWaves)).toEqual({ rating: 'acceptable', side: 'high' });
    expect(rateValue(2.5, surfWaves)).toEqual({ rating: 'uncomfortable', side: 'high' });
  });
  it('מדרגות הסטטוס', () => {
    expect([85, 84, 60, 59, 35, 34].map(statusFor)).toEqual(['excellent', 'good', 'good', 'fair', 'fair', 'poor']);
  });
});

describe('קובץ הספים תקין', () => {
  for (const [activity, rules] of Object.entries(SCORING.activities)) {
    it(`${activity}: המשקלים מסתכמים ל-1, והטווח הנוח בתוך הטווח הסביר`, () => {
      const total = Object.values(rules).reduce((sum, r) => sum + r!.weight, 0);
      expect(total).toBeCloseTo(1, 5);
      for (const param of SCORED_PARAMS) {
        const r = rules[param];
        if (!r) continue;
        expect(r.acceptable.min ?? -Infinity).toBeLessThanOrEqual(r.comfortable.min ?? -Infinity);
        expect(r.acceptable.max ?? Infinity).toBeGreaterThanOrEqual(r.comfortable.max ?? Infinity);
      }
    });
  }
});
