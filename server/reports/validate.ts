// בדיקת דיווח שנכנס לשרת: חוף ופעילות מהקטלוג, הצבעה כן/לא, סיבה מהרשימה הקבועה בלבד,
// ומזהה אנונימי בפורמט UUID. כל דבר אחר נדחה. אין שדה טקסט חופשי.
// מתי נוגעים: כשמוסיפים שדה לדיווח.
import catalog from '../../config/beaches.json';
import rules from '../../config/reports.json';

export const ACTIVITY_IDS = ['beach', 'swim', 'kids', 'surf', 'sup', 'sail'] as const;
const BEACH_IDS = new Set(catalog.beaches.map((b) => b.id));
const REASONS = { true: new Set(rules.reasons.positive), false: new Set(rules.reasons.negative) };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ReportInput {
  beachId: string;
  activity: string;
  isAccurate: boolean;
  reason: string | null;
  reporterId: string;
}

export type Validation = { ok: true; value: ReportInput } | { ok: false; error: string };

export function isKnownPlace(beachId: unknown, activity: unknown): boolean {
  return typeof beachId === 'string' && BEACH_IDS.has(beachId) && (ACTIVITY_IDS as readonly unknown[]).includes(activity);
}

export function validateReport(body: unknown): Validation {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid_body' };
  const b = body as Record<string, unknown>;
  const allowed = new Set(['beachId', 'activity', 'isAccurate', 'reason', 'reporterId']);
  if (Object.keys(b).some((k) => !allowed.has(k))) return { ok: false, error: 'unknown_field' };
  if (!isKnownPlace(b.beachId, b.activity)) return { ok: false, error: 'unknown_beach_or_activity' };
  if (typeof b.isAccurate !== 'boolean') return { ok: false, error: 'invalid_vote' };
  if (typeof b.reporterId !== 'string' || !UUID.test(b.reporterId)) return { ok: false, error: 'invalid_reporter' };
  const reason = b.reason ?? null;
  if (reason !== null && (typeof reason !== 'string' || !REASONS[String(b.isAccurate) as 'true' | 'false'].has(reason))) {
    return { ok: false, error: 'invalid_reason' };
  }
  return {
    ok: true,
    value: { beachId: b.beachId as string, activity: b.activity as string, isAccurate: b.isAccurate, reason: reason as string | null, reporterId: b.reporterId },
  };
}
