// בודק ומנקה את קובץ התחזית לפני שהמסכים משתמשים בו.
// ערך חסר, לא מספר, ביחידה לא נכונה או מחוץ לטווח הגיוני הופך ל-null (מוצג "לא זמין").
// קובץ במבנה שבור כולו מחזיר null, והאתר מציג "הנתונים לא זמינים".
// מתי נוגעים: כשמשנים את חוזה הנתונים (dataContract.ts).
import {
  FIELD_NAMES,
  FIELD_RULES,
  FieldName,
  FieldValue,
  FieldValueSchema,
  ForecastFileSchema,
  HourRow,
  HourRowSchema,
  NormalizedForecast,
} from './dataContract';

export function normalizeField(name: FieldName, raw: unknown): FieldValue {
  const rule = FIELD_RULES[name];
  const parsed = FieldValueSchema.safeParse(raw);
  if (!parsed.success) return { value: null, unit: rule.unit, source: 'unknown', fetchedAt: null };
  const field = parsed.data;
  const ok =
    field.value !== null &&
    Number.isFinite(field.value) &&
    field.unit === rule.unit &&
    field.value >= rule.min &&
    field.value <= rule.max;
  return { ...field, unit: rule.unit, value: ok ? field.value : null };
}

export function normalizeHour(raw: unknown): HourRow | null {
  const parsed = HourRowSchema.safeParse(raw);
  if (!parsed.success) {
    // שורה בלי שעה תקינה לא שימושית. שדות פגומים לבד לא מפילים את השורה.
    const time = (raw as { localTime?: unknown } | null)?.localTime;
    if (typeof time !== 'string' || !/^([01]\d|2[0-3]):00$/.test(time)) return null;
  }
  const row = raw as { localTime: string; validAt?: unknown; fields?: Record<string, unknown> };
  const fields = {} as Record<FieldName, FieldValue>;
  for (const name of FIELD_NAMES) fields[name] = normalizeField(name, row.fields?.[name]);
  return { localTime: row.localTime, validAt: typeof row.validAt === 'string' ? row.validAt : null, fields };
}

export function normalizeForecastFile(raw: unknown): NormalizedForecast | null {
  const parsed = ForecastFileSchema.safeParse(raw);
  if (!parsed.success) return null;
  const series: Record<string, HourRow[]> = {};
  for (const beach of parsed.data.beaches) {
    const seen = new Set<string>();
    const rows: HourRow[] = [];
    for (const rawHour of beach.hours) {
      const row = normalizeHour(rawHour);
      if (row && !seen.has(row.localTime)) {
        seen.add(row.localTime);
        rows.push(row);
      }
    }
    rows.sort((a, b) => a.localTime.localeCompare(b.localTime));
    series[beach.beachId] = rows;
  }
  return { dataMode: parsed.data.dataMode, generatedAt: parsed.data.generatedAt, series };
}
