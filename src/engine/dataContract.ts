// חוזה הנתונים: איך נראה קובץ התחזית שהאתר קורא (public/data/forecast.json).
// כל נתון שמור כערך, יחידה, מקור וזמן משיכה. נתון חסר הוא null, לעולם לא 0.
// מתי נוגעים: כשמוסיפים סוג נתון חדש (למשל זרמים). שינוי כאן מחייב עדכון של normalize.ts.
import { z } from 'zod';

export const FIELD_NAMES = [
  'airTemperature',
  'waterTemperature',
  'windSpeed',
  'windDirection',
  'waveHeight',
  'wavePeriod',
  'uvIndex',
  'precipitationChance',
] as const;

export type FieldName = (typeof FIELD_NAMES)[number];

// היחידה הצפויה וטווח הערכים ההגיוני לכל נתון. ערך מחוץ לטווח הופך ל-null.
export const FIELD_RULES: Record<FieldName, { unit: string; min: number; max: number }> = {
  airTemperature: { unit: '°C', min: -30, max: 60 },
  waterTemperature: { unit: '°C', min: 0, max: 40 },
  windSpeed: { unit: 'km/h', min: 0, max: 250 },
  windDirection: { unit: 'deg', min: 0, max: 360 },
  waveHeight: { unit: 'm', min: 0, max: 20 },
  wavePeriod: { unit: 's', min: 0, max: 30 },
  uvIndex: { unit: 'index', min: 0, max: 20 },
  precipitationChance: { unit: '%', min: 0, max: 100 },
};

export const FieldValueSchema = z.object({
  value: z.number().nullable(),
  unit: z.string(),
  source: z.string(),
  fetchedAt: z.string().nullable(),
});
export type FieldValue = z.infer<typeof FieldValueSchema>;

export const HourRowSchema = z.object({
  localTime: z.string().regex(/^([01]\d|2[0-3]):00$/),
  validAt: z.string().nullable(),
  fields: z.record(z.string(), FieldValueSchema),
});
export type HourRow = { localTime: string; validAt: string | null; fields: Record<FieldName, FieldValue> };

export const ForecastFileSchema = z.object({
  schemaVersion: z.literal(1),
  dataMode: z.enum(['mock', 'live']),
  timezone: z.string(),
  generatedAt: z.string().nullable(),
  beaches: z.array(z.object({ beachId: z.string(), hours: z.array(z.unknown()) })),
});

export interface NormalizedForecast {
  dataMode: 'mock' | 'live';
  generatedAt: string | null;
  series: Record<string, HourRow[]>;
}
