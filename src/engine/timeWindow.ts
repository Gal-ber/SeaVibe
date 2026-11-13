// מוצא את חלון הזמן הנוח ביותר היום: רצף של 2–3 שעות עם הציון הממוצע הגבוה ביותר.
// מחפשים רק מהשעה הנוכחית ועד סוף טווח היום (06:00–20:00 לפי config/scoring.json).
// אם אין רצף שכל שעותיו מעל הסף, אין חלון (מוצג "אין היום חלון נוח").
// מתי נוגעים: כשמשנים איך בוחרים חלון. אורך החלון והסף נמצאים בקובץ ההגדרות.
import { SCORING } from './scoringConfig';

export interface TimeWindow {
  start: string;
  end: string;
  averageScore: number;
}

const hourNum = (t: string) => Number(t.slice(0, 2));
const label = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;

export function findBestWindow(hourScores: { time: string; score: number | null }[], currentTime: string | null): TimeWindow | null {
  const { from, to, minHours, maxHours, minScore } = SCORING.window;
  const startHour = Math.max(hourNum(from), currentTime ? hourNum(currentTime) : 0);
  const usable = hourScores.filter((h) => hourNum(h.time) >= startHour && hourNum(h.time) < hourNum(to));

  let best: TimeWindow | null = null;
  for (let i = 0; i < usable.length; i++) {
    for (let len = minHours; len <= maxHours; len++) {
      const slice = usable.slice(i, i + len);
      if (slice.length < len) break;
      const consecutive = slice.every((h, k) => k === 0 || hourNum(h.time) === hourNum(slice[k - 1].time) + 1);
      if (!consecutive || slice.some((h) => h.score === null || h.score < minScore)) continue;
      const avg = slice.reduce((sum, h) => sum + (h.score as number), 0) / len;
      // ממוצע גבוה יותר מנצח. בתיקו: חלון ארוך יותר, ואז מוקדם יותר.
      const better = !best || avg > best.averageScore + 1e-9 ||
        (Math.abs(avg - best.averageScore) < 1e-9 && len > hourNum(best.end) - hourNum(best.start));
      if (better) best = { start: slice[0].time, end: label(hourNum(slice[len - 1].time) + 1), averageScore: Math.round(avg) };
    }
  }
  return best;
}
