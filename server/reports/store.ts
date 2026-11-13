// שמירה וסיכום של דיווחי שטח במסד D1.
// - דיווח אחד לכל מדווח, חוף ופעילות בחלון של 4 שעות: דיווח חדש מחליף את הקודם.
// - הגבלת קצב: עד 20 דיווחים לשעה לכל מדווח.
// - מחיקה אוטומטית של דיווחים בני יותר מ-7 ימים.
// - המזהה האנונימי נשמר רק כ-hash עם "מלח" סודי (REPORTER_SALT) שנמצא רק בהגדרות השרת.
// מתי נוגעים: כשמשנים את כללי השמירה. המספרים עצמם ב-config/reports.json.
import rules from '../../config/reports.json';
import { D1Database } from './d1';
import { ReportInput } from './validate';

const HOUR = 3_600_000;

export async function hashReporter(reporterId: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${reporterId}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export type SaveResult = 'saved' | 'rate_limited';

export async function saveReport(db: D1Database, input: ReportInput, salt: string, now: number): Promise<SaveResult> {
  const reporter = await hashReporter(input.reporterId, salt);
  await db.prepare('DELETE FROM reports WHERE created_at < ?').bind(now - rules.retentionDays * 24 * HOUR).run();

  const recent = await db
    .prepare('SELECT COUNT(*) AS n FROM reports WHERE reporter = ? AND created_at >= ?')
    .bind(reporter, now - HOUR)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= rules.maxReportsPerReporterPerHour) return 'rate_limited';

  await db.batch([
    db
      .prepare('DELETE FROM reports WHERE reporter = ? AND beach_id = ? AND activity = ? AND created_at >= ?')
      .bind(reporter, input.beachId, input.activity, now - rules.windowHours * HOUR),
    db
      .prepare('INSERT INTO reports (id, beach_id, activity, vote, reason, reporter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), input.beachId, input.activity, input.isAccurate ? 1 : 0, input.reason, reporter, now),
  ]);
  return 'saved';
}

export interface ReportCounts {
  total: number;
  positive: number;
  topReasons: string[];
}

export async function getCounts(db: D1Database, beachId: string, activity: string, now: number): Promise<ReportCounts> {
  const since = now - rules.windowHours * HOUR;
  const row = await db
    .prepare('SELECT COUNT(*) AS total, COALESCE(SUM(vote), 0) AS positive FROM reports WHERE beach_id = ? AND activity = ? AND created_at >= ?')
    .bind(beachId, activity, since)
    .first<{ total: number; positive: number }>();
  const total = row?.total ?? 0;
  if (total < rules.minReportsForSummary) return { total, positive: 0, topReasons: [] };
  const reasons = await db
    .prepare('SELECT reason, COUNT(*) AS c FROM reports WHERE beach_id = ? AND activity = ? AND created_at >= ? AND reason IS NOT NULL GROUP BY reason ORDER BY c DESC LIMIT 2')
    .bind(beachId, activity, since)
    .all<{ reason: string }>();
  return { total, positive: row?.positive ?? 0, topReasons: reasons.results.map((r) => r.reason) };
}
