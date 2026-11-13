// בדיקות לבדיקת הנתונים: ערך חסר או שגוי הופך ל-null, ולעולם לא ל-0.
import { describe, expect, it } from 'vitest';
import { normalizeField, normalizeForecastFile, normalizeHour } from '../../src/engine/normalize';

const field = (value: unknown, unit = 'm') => ({ value, unit, source: 'mock', fetchedAt: null });

describe('normalizeField', () => {
  it('ערך תקין נשמר כמו שהוא', () => {
    expect(normalizeField('waveHeight', field(0.4)).value).toBe(0.4);
  });
  it('ערך 0 תקין נשאר 0 (גל שטוח הוא נתון אמיתי)', () => {
    expect(normalizeField('waveHeight', field(0)).value).toBe(0);
  });
  it('נתון חסר לגמרי הופך ל-null עם היחידה הנכונה', () => {
    const result = normalizeField('waveHeight', undefined);
    expect(result.value).toBeNull();
    expect(result.unit).toBe('m');
  });
  it('null נשאר null', () => {
    expect(normalizeField('waveHeight', field(null)).value).toBeNull();
  });
  it('גל שלילי נדחה', () => {
    expect(normalizeField('waveHeight', field(-3)).value).toBeNull();
  });
  it('ערך מחוץ לטווח ההגיוני נדחה', () => {
    expect(normalizeField('airTemperature', field(99, '°C')).value).toBeNull();
  });
  it('טקסט במקום מספר נדחה', () => {
    expect(normalizeField('waveHeight', field('0.4')).value).toBeNull();
  });
  it('יחידה לא נכונה נדחית (למשל רגל במקום מטר)', () => {
    expect(normalizeField('waveHeight', field(2, 'ft')).value).toBeNull();
  });
});

describe('normalizeHour', () => {
  it('שדה חסר בשורה הופך ל-null, ושאר השדות נשמרים', () => {
    const row = normalizeHour({ localTime: '10:00', validAt: null, fields: { waveHeight: field(0.5) } });
    expect(row?.fields.waveHeight.value).toBe(0.5);
    expect(row?.fields.windSpeed.value).toBeNull();
  });
  it('שורה בלי שעה תקינה נזרקת', () => {
    expect(normalizeHour({ localTime: '25:00', fields: {} })).toBeNull();
    expect(normalizeHour(null)).toBeNull();
  });
});

describe('normalizeForecastFile', () => {
  it('קובץ במבנה שבור מחזיר null', () => {
    expect(normalizeForecastFile({ hello: 'world' })).toBeNull();
    expect(normalizeForecastFile(null)).toBeNull();
  });
  it('שעות כפולות נזרקות והסדר מתוקן', () => {
    const hour = (t: string) => ({ localTime: t, validAt: null, fields: {} });
    const result = normalizeForecastFile({
      schemaVersion: 1, dataMode: 'mock', timezone: 'Asia/Jerusalem', generatedAt: null,
      beaches: [{ beachId: 'x', hours: [hour('11:00'), hour('10:00'), hour('10:00')] }],
    });
    expect(result?.series.x.map((h) => h.localTime)).toEqual(['10:00', '11:00']);
  });
});
