// המשימה המתוזמנת (Cloudflare Cron Trigger, כל 3 שעות): מושכת תחזית מ-Open-Meteo ושומרת במסד.
// - הכתובות נבנות רק מ-data-sources/sources.config.json. אין כאן כתובות.
// - בלם קשיח: מעל 100 קריאות ביום (dailyCallLimit) לא מושכים.
// - כל קריאה נספרת לפני שהיא יוצאת, גם אם תיכשל.
// - נתונים שלא עוברים את בדיקת החוזה לא נשמרים, והעותק הקודם נשאר.
// מתי נוגעים: כשמשנים את תהליך המשיכה. פעיל רק אחרי פריסה באישור הבעלים.
import { D1Database } from '../../server/reports/d1';
import { callsToday, countCall, saveSnapshot } from '../../server/forecast/store';
import { normalizeForecastFile } from '../../src/engine/normalize';
import { buildRequestUrl, DAILY_CALL_LIMIT, isAllowedUrl, SOURCES, toForecastFile } from './openMeteo';

export type FetchOutcome = { status: 'saved' | 'skipped_limit' | 'failed'; calls: number; reason?: string };
type FetchImpl = (url: string, init?: RequestInit) => Promise<Response>;

export async function runFetch(db: D1Database, fetchImpl: FetchImpl, now: Date): Promise<FetchOutcome> {
  const day = now.toISOString().slice(0, 10); // יום לפי UTC, כמו המכסה של Open-Meteo
  let calls = await callsToday(db, day);
  if (calls + SOURCES.length > DAILY_CALL_LIMIT) return { status: 'skipped_limit', calls };

  const responses: Record<string, unknown> = {};
  for (const source of SOURCES) {
    const url = buildRequestUrl(source);
    if (!isAllowedUrl(url)) continue; // כתובת מחוץ לרשימה הלבנה: לא פונים בכלל
    await countCall(db, day);
    calls += 1;
    try {
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(15_000) });
      if (res.ok) responses[source.id] = await res.json();
    } catch {
      // מקור שנכשל: השדות שלו יהיו null
    }
  }

  try {
    const file = toForecastFile(responses, now);
    if (!normalizeForecastFile(file)) return { status: 'failed', calls, reason: 'contract' };
    await saveSnapshot(db, JSON.stringify(file), now.getTime());
    return { status: 'saved', calls };
  } catch (error) {
    return { status: 'failed', calls, reason: error instanceof Error ? error.message : 'unknown' };
  }
}

export default {
  async scheduled(_event: unknown, env: { DB: D1Database }, ctx: { waitUntil(p: Promise<unknown>): void }) {
    ctx.waitUntil(runFetch(env.DB, fetch, new Date()));
  },
};
