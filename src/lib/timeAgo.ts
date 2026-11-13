// "לפני X דקות / שעות" בשפה הנבחרת, לתווית "עודכן לפני X" כשאין רשת.
import { Lang, translate } from '../i18n/translate';

export function timeAgo(iso: string, now: Date, lang: Lang): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return translate(lang, 'ago.now');
  if (minutes < 60) return translate(lang, 'ago.minutes', { n: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 48) return translate(lang, 'ago.hours', { n: hours });
  return translate(lang, 'ago.days', { n: Math.round(hours / 24) });
}
