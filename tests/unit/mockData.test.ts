// בדיקות לקובץ נתוני הדוגמה: עומד בחוזה, מכסה את כל החופים, ומעודכן מול הפרופילים.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizeForecastFile } from '../../src/engine/normalize';
import { FIELD_NAMES } from '../../src/engine/dataContract';
import { generateMockForecast, readProfiles } from '../../scripts/generate-mock.mjs';

const file = JSON.parse(readFileSync('public/data/forecast.json', 'utf8'));
const catalog = JSON.parse(readFileSync('config/beaches.json', 'utf8'));

describe('קובץ נתוני הדוגמה', () => {
  it('זהה למה שהסקריפט מייצר (אם נכשל: npm run mock:generate)', () => {
    expect(file).toEqual(generateMockForecast(readProfiles()));
  });
  it('מסומן כנתוני דוגמה', () => {
    expect(file.dataMode).toBe('mock');
  });
  it('יש נתונים לכל 7 החופים בקטלוג, 24 שעות לכל חוף', () => {
    const normalized = normalizeForecastFile(file)!;
    const ids = catalog.beaches.map((b: { id: string }) => b.id).sort();
    expect(Object.keys(normalized.series).sort()).toEqual(ids);
    for (const id of ids) expect(normalized.series[id]).toHaveLength(24);
  });
  it('אף ערך לא נזרק בבדיקה (חוץ מהערך שחסר בכוונה)', () => {
    const normalized = normalizeForecastFile(file)!;
    for (const [beachId, rows] of Object.entries(normalized.series)) {
      for (const row of rows) {
        for (const name of FIELD_NAMES) {
          const intentionallyMissing = beachId === 'eilat' && name === 'waterTemperature';
          expect(row.fields[name].value === null).toBe(intentionallyMissing);
        }
      }
    }
  });
});
