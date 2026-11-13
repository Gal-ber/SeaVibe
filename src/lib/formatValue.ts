// מציג ערך עם היחידה שלו, באותו פורמט בכל המסכים (כרטיס, טבלה, מועדפים).
// ערך חסר (null) מוצג "לא זמין", לעולם לא 0.
// מתי נוגעים: כשמשנים איך מספר או יחידה נראים במסך.
import texts from '../../config/texts/he.json';

export type DisplayKind = 'temperature' | 'windSpeed' | 'waveHeight';

export const UNAVAILABLE = texts['value.unavailable'];

export function formatNumber(kind: DisplayKind, value: number | null): string {
  if (value === null) return UNAVAILABLE;
  return kind === 'waveHeight' ? value.toFixed(1) : String(Math.round(value));
}

export function formatValue(kind: DisplayKind, value: number | null): string {
  if (value === null) return UNAVAILABLE;
  const n = formatNumber(kind, value);
  if (kind === 'temperature') return `${n}${texts['unit.celsius']}`;
  if (kind === 'windSpeed') return `${n} ${texts['unit.kmh']}`;
  return `${n} ${texts['unit.meters']}`;
}
