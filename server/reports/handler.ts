// השרת של דיווחי השטח: /api/reports באותה כתובת של האתר.
// GET  ?beach=gordon&activity=swim  ← סיכום 4 השעות האחרונות (בלי פרטים של מדווחים)
// POST { beachId, activity, isAccurate, reason, reporterId } ← שמירת דיווח
// לא פונה לשום כתובת חיצונית. בלי "מלח" סודי מוגדר, השרת מסרב לעבוד (לא ממציא ערך ברירת מחדל).
// מתי נוגעים: כשמשנים את הממשק בין האתר לשרת.
import { D1Database } from './d1';
import { isKnownPlace, validateReport } from './validate';
import { getCounts, saveReport } from './store';

export interface ReportsEnv {
  DB: D1Database;
  REPORTER_SALT?: string;
}

const MAX_BODY = 1024;
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function handleReportsRequest(request: Request, env: ReportsEnv, now: number): Promise<Response> {
  if (!env.REPORTER_SALT || env.REPORTER_SALT.length < 16) return json(500, { error: 'not_configured' });
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const beachId = url.searchParams.get('beach');
    const activity = url.searchParams.get('activity');
    if (!isKnownPlace(beachId, activity)) return json(400, { error: 'unknown_beach_or_activity' });
    return json(200, await getCounts(env.DB, beachId!, activity!, now));
  }

  if (request.method === 'POST') {
    // רק מהאתר שלנו: אם הדפדפן שלח Origin, הוא חייב להיות זהה לכתובת השרת
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return json(403, { error: 'forbidden_origin' });
    if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return json(415, { error: 'json_only' });
    const text = await request.text();
    if (text.length > MAX_BODY) return json(413, { error: 'too_large' });
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return json(400, { error: 'invalid_json' });
    }
    const check = validateReport(body);
    if ('error' in check) return json(400, { error: check.error });
    const result = await saveReport(env.DB, check.value, env.REPORTER_SALT, now);
    return result === 'saved' ? json(201, { ok: true }) : json(429, { error: 'rate_limited' });
  }

  return json(405, { error: 'method_not_allowed' });
}
