// שמירה וקריאה של עותקי התחזית במסד D1, ומונה הקריאות היומי למקור.
// מתי נוגעים: כשמשנים כמה עותקים שומרים. הבלם היומי והגיל המקסימלי ב-data-sources/sources.config.json.
import { D1Database } from '../reports/d1';

const KEEP_SNAPSHOTS = 8;

export async function callsToday(db: D1Database, day: string): Promise<number> {
  const row = await db.prepare('SELECT calls FROM fetch_log WHERE day = ?').bind(day).first<{ calls: number }>();
  return row?.calls ?? 0;
}

export async function countCall(db: D1Database, day: string): Promise<void> {
  await db
    .prepare('INSERT INTO fetch_log (day, calls) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET calls = calls + 1')
    .bind(day)
    .run();
}

export async function saveSnapshot(db: D1Database, body: string, now: number): Promise<void> {
  await db.batch([
    db.prepare('INSERT INTO forecast_snapshots (created_at, body) VALUES (?, ?)').bind(now, body),
    db
      .prepare('DELETE FROM forecast_snapshots WHERE id NOT IN (SELECT id FROM forecast_snapshots ORDER BY created_at DESC LIMIT ?)')
      .bind(KEEP_SNAPSHOTS),
  ]);
}

export async function latestSnapshot(db: D1Database): Promise<{ createdAt: number; body: string } | null> {
  const row = await db
    .prepare('SELECT created_at, body FROM forecast_snapshots ORDER BY created_at DESC LIMIT 1')
    .first<{ created_at: number; body: string }>();
  return row ? { createdAt: row.created_at, body: row.body } : null;
}
