// מציג ערך עם היחידה שלו, באותו פורמט בכל המסכים (כרטיס, טבלה, מועדפים), בשפה הנבחרת.
// ערך חסר (null) מוצג "לא זמין", לעולם לא 0.
// מתי נוגעים: כשמשנים איך מספר או יחידה נראים במסך.
import { Lang, translate } from '../i18n/translate';

export type DisplayKind = 'temperature' | 'windSpeed' | 'waveHeight';

export const unavailable = (lang: Lang = 'he') => translate(lang, 'value.unavailable');

export function formatNumber(kind: DisplayKind, value: number | null, lang: Lang = 'he'): string {
  if (value === null) return unavailable(lang);
  return kind === 'waveHeight' ? value.toFixed(1) : String(Math.round(value));
}

export function formatValue(kind: DisplayKind, value: number | null, lang: Lang = 'he'): string {
  if (value === null) return unavailable(lang);
  const n = formatNumber(kind, value, lang);
  if (kind === 'temperature') return `${n}${translate(lang, 'unit.celsius')}`;
  if (kind === 'windSpeed') return `${n} ${translate(lang, 'unit.kmh')}`;
  return `${n} ${translate(lang, 'unit.meters')}`;
}
