// בדיקות להתנהגות: כללי סיכום דיווחי שטח (FR-10) וחוף קרוב (FR-3).
import { describe, expect, it } from 'vitest';
import { summarizeFieldReports } from '../../src/lib/fieldReports';
import { nearestBeachId } from '../../src/lib/location';
import { FieldReport } from '../../src/types';

const reports = (yes: number, no: number): FieldReport[] =>
  [...Array(yes).fill(true), ...Array(no).fill(false)].map((isAccurate, i) => ({
    id: String(i), beachId: 'gordon', activity: 'swim', isAccurate, reason: 'reason.goodWaves', createdAt: new Date().toISOString(),
  }));

describe('סיכום דיווחי שטח', () => {
  it('0 דיווחים: עדיין אין מספיק', () => {
    expect(summarizeFieldReports([], 'שחייה').summaryText).toBe('עדיין אין מספיק דיווחים מהשטח');
  });
  it('1–4 דיווחים: "מעט דיווחים" ומספר, בלי אחוזים ובלי סיבות', () => {
    const s = summarizeFieldReports(reports(3, 1), 'שחייה');
    expect(s.summaryText).toContain('מעט דיווחים (4)');
    expect(s.summaryText).not.toContain('%');
    expect(s.positivePercentage).toBe(0);
    expect(s.topReasons).toEqual([]);
  });
  it('5 ומעלה: "X מתוך Y"', () => {
    expect(summarizeFieldReports(reports(4, 2), 'שחייה').summaryText).toBe('4 מתוך 6 דיווחים: מתאים לשחייה');
  });
});

describe('החוף הקרוב', () => {
  it('לפי מיקום בתוך ישראל', () => {
    expect(nearestBeachId(32.08, 34.77)).toBe('gordon');
    expect(nearestBeachId(32.8, 34.97)).toBe('haifa');
    expect(nearestBeachId(29.55, 34.95)).toBe('eilat');
  });
  it('מחוץ לישראל: החוף הנתמך הקרוב, לא חוף מומצא', () => {
    expect(['gordon', 'herzliya', 'palmachim', 'netanya', 'haifa', 'ashdod', 'eilat']).toContain(nearestBeachId(51.5, -0.12));
    expect(nearestBeachId(30.04, 31.24)).toBe('eilat'); // קהיר
  });
});
