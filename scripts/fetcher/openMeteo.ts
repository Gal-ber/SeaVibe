// מתאם Open-Meteo: בונה את כתובות הבקשה מתוך data-sources/sources.config.json,
// ומתרגם את התשובות לחוזה הנתונים שלנו (אותו מבנה כמו public/data/forecast.json, עם dataMode: "live").
// אין כאן רשת: רק בנייה ותרגום. הפנייה עצמה נעשית ב-worker.ts.
// - יחידה לא צפויה מהמקור: הערך הופך ל-null (לא מנחשים המרה).
// - מקור שנכשל: השדות שלו null, והשדות של המקור השני נשמרים.
// מתי נוגעים: כשמוסיפים נתון ממקור קיים. כתובות ופרמטרים משנים בקובץ ההגדרות, לא כאן.
import sourcesConfig from '../../data-sources/sources.config.json';
import catalog from '../../config/beaches.json';
import { FIELD_RULES, FieldName } from '../../src/engine/dataContract';

export interface SourceConfig {
  id: string;
  enabled: boolean;
  url: string;
  params: Record<string, string>;
  fields: Record<string, { variable: string; unit: string }>;
  point: 'land' | 'sea';
}
interface Beach { id: string; lat: number; lng: number; sea: { lat: number; lng: number } }

export const SOURCES = (sourcesConfig.sources as SourceConfig[]).filter((s) => s.enabled);
export const BEACHES = catalog.beaches as Beach[];
export const DAILY_CALL_LIMIT: number = sourcesConfig.dailyCallLimit;

export function buildRequestUrl(source: SourceConfig, beaches: Beach[] = BEACHES): string {
  const points = beaches.map((b) => (source.point === 'sea' ? b.sea : { lat: b.lat, lng: b.lng }));
  const query = new URLSearchParams({
    latitude: points.map((p) => p.lat).join(','),
    longitude: points.map((p) => p.lng).join(','),
    hourly: Object.values(source.fields).map((f) => f.variable).join(','),
    ...source.params,
  });
  return `${source.url}?${query.toString()}`;
}

interface LocationResponse {
  utc_offset_seconds?: number;
  hourly_units?: Record<string, string>;
  hourly?: Record<string, unknown[]>;
}

const offsetLabel = (seconds: number) => {
  const sign = seconds < 0 ? '-' : '+';
  const abs = Math.abs(seconds);
  return `${sign}${String(Math.floor(abs / 3600)).padStart(2, '0')}:${String(Math.floor((abs % 3600) / 60)).padStart(2, '0')}`;
};

type Field = { value: number | null; unit: string; source: string; fetchedAt: string | null };
type Hour = { localTime: string; validAt: string; fields: Record<string, Field> };

// תשובה של Open-Meteo לכמה מיקומים היא מערך, ולמיקום אחד היא אובייקט
const asList = (response: unknown): LocationResponse[] =>
  Array.isArray(response) ? response : response && typeof response === 'object' ? [response as LocationResponse] : [];

export function toForecastFile(responses: Record<string, unknown>, fetchedAt: Date, beaches: Beach[] = BEACHES, sources: SourceConfig[] = SOURCES) {
  const fetched = fetchedAt.toISOString();
  const usable = sources.filter((s) => asList(responses[s.id]).length === beaches.length);
  if (usable.length === 0) throw new Error('no usable source responses');

  return {
    schemaVersion: 1 as const,
    dataMode: 'live' as const,
    timezone: 'Asia/Jerusalem',
    generatedAt: fetched,
    beaches: beaches.map((beach, i) => {
      const hours = new Map<string, Hour>();
      for (const source of sources) {
        const loc = usable.includes(source) ? asList(responses[source.id])[i] : undefined;
        const times = (loc?.hourly?.time ?? []) as string[];
        const offset = offsetLabel(loc?.utc_offset_seconds ?? 0);
        times.forEach((time, t) => {
          if (typeof time !== 'string' || !/T\d{2}:00$/.test(time)) return;
          const validAt = `${time}:00${offset}`;
          const hour = hours.get(validAt) ?? { localTime: time.slice(11, 16), validAt, fields: {} };
          for (const [name, spec] of Object.entries(source.fields)) {
            const raw = loc?.hourly?.[spec.variable]?.[t];
            const unitOk = loc?.hourly_units?.[spec.variable] === spec.unit;
            hour.fields[name] = {
              value: unitOk && typeof raw === 'number' && Number.isFinite(raw) ? raw : null,
              unit: FIELD_RULES[name as FieldName].unit,
              source: source.id,
              fetchedAt: fetched,
            };
          }
          hours.set(validAt, hour);
        });
      }
      return { beachId: beach.id, hours: [...hours.values()].sort((a, b) => a.validAt.localeCompare(b.validAt)) };
    }),
  };
}
