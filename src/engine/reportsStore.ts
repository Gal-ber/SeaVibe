// שכבת האחסון של דיווחי השטח: מקום אחד שממנו המסכים קוראים וכותבים דיווחים.
// local  (ברירת מחדל): הדיווחים נשמרים רק במכשיר. אין שום פנייה לרשת.
// remote: הדיווחים נשלחים לשרת שלנו בכתובת /api/reports באותו אתר (Cloudflare, אחרי אישור הבעלים).
// בשני המצבים, ההצבעה שלך נשמרת גם במכשיר, כדי להציג "דיווחת: ..." ולאפשר שינוי.
// זה אחד משני הקבצים היחידים שמותר בהם fetch, ורק ל-/api/reports (נבדק ב-npm run check).
// מתי נוגעים: כשמחליפים ספק מסד נתונים. המסכים לא צריכים להשתנות.
import appConfig from '../../config/app.config.json';
import rules from '../../config/reports.json';
import { ActivityId } from '../types';

export interface ReportCounts {
  total: number;
  positive: number;
  topReasons: string[];
}
export interface MyVote {
  isAccurate: boolean;
  at: number;
}
export type SubmitResult = 'saved' | 'rate_limited' | 'error';

const API = '/api/reports';
const LOCAL_KEY = 'seavibes_reports';
const VOTES_KEY = 'seavibes_my_votes';
const REPORTER_KEY = 'seavibes_reporter_id';
const WINDOW = rules.windowHours * 3_600_000;

export const reportsMode = (): 'local' | 'remote' => (appConfig.reportsMode === 'remote' ? 'remote' : 'local');

interface LocalReport { beachId: string; activity: string; isAccurate: boolean; reason: string | null; at: number }
const read = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* אחסון לא זמין */ }
};
const fresh = (at: number, now: number) => now - at < WINDOW;

export function countLocal(reports: LocalReport[], beachId: string, activity: string, now: number): ReportCounts {
  const list = reports.filter((r) => r.beachId === beachId && r.activity === activity && fresh(r.at, now));
  if (list.length < rules.minReportsForSummary) return { total: list.length, positive: 0, topReasons: [] };
  const reasonCounts: Record<string, number> = {};
  for (const r of list) if (r.reason) reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  return {
    total: list.length,
    positive: list.filter((r) => r.isAccurate).length,
    topReasons: Object.entries(reasonCounts).sort(([, a], [, b]) => b - a).slice(0, 2).map(([r]) => r),
  };
}

export function getMyVote(beachId: string, activity: ActivityId, now = Date.now()): MyVote | null {
  const vote = read<Record<string, MyVote>>(VOTES_KEY, {})[`${beachId}|${activity}`];
  return vote && fresh(vote.at, now) ? vote : null;
}

function reporterId(): string {
  let id = read<string | null>(REPORTER_KEY, null);
  if (!id) { id = crypto.randomUUID(); write(REPORTER_KEY, id); }
  return id;
}

export async function loadCounts(beachId: string, activity: ActivityId, now = Date.now()): Promise<ReportCounts | null> {
  if (reportsMode() === 'local') return countLocal(read<LocalReport[]>(LOCAL_KEY, []), beachId, activity, now);
  try {
    const res = await fetch(`${API}?beach=${encodeURIComponent(beachId)}&activity=${encodeURIComponent(activity)}`, { cache: 'no-store' });
    return res.ok ? ((await res.json()) as ReportCounts) : null;
  } catch {
    return null;
  }
}

export async function submitReport(beachId: string, activity: ActivityId, isAccurate: boolean, reason: string | null, now = Date.now()): Promise<SubmitResult> {
  let result: SubmitResult = 'saved';
  if (reportsMode() === 'local') {
    const others = read<LocalReport[]>(LOCAL_KEY, []).filter((r) => fresh(r.at, now) && !(r.beachId === beachId && r.activity === activity));
    write(LOCAL_KEY, [{ beachId, activity, isAccurate, reason, at: now }, ...others]);
  } else {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beachId, activity, isAccurate, reason, reporterId: reporterId() }),
      });
      result = res.status === 201 ? 'saved' : res.status === 429 ? 'rate_limited' : 'error';
    } catch {
      result = 'error';
    }
  }
  if (result === 'saved') {
    const votes = read<Record<string, MyVote>>(VOTES_KEY, {});
    votes[`${beachId}|${activity}`] = { isAccurate, at: now };
    write(VOTES_KEY, votes);
  }
  return result;
}
