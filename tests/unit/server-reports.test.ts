// בדיקות לשרת דיווחי השטח, מול SQLite מקומי (בלי Cloudflare ובלי אינטרנט).
import { describe, expect, it } from 'vitest';
import { createTestD1 } from '../helpers/d1-shim';
import { handleReportsRequest } from '../../server/reports/handler';
import { validateReport } from '../../server/reports/validate';

const SALT = 'test-salt-0123456789abcdef';
const ORIGIN = 'https://seavibes.example';
const NOW = Date.UTC(2026, 6, 1, 9, 0);
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

function setup() {
  const db = createTestD1();
  const env = { DB: db, REPORTER_SALT: SALT };
  const post = (body: unknown, now = NOW, headers: Record<string, string> = {}) =>
    handleReportsRequest(
      new Request(`${ORIGIN}/api/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers }, body: JSON.stringify(body) }),
      env,
      now,
    );
  const get = async (beach = 'gordon', activity = 'swim', now = NOW) =>
    (await handleReportsRequest(new Request(`${ORIGIN}/api/reports?beach=${beach}&activity=${activity}`), env, now)).json();
  return { db, env, post, get };
}
const report = (n: number, isAccurate = true, extra: Record<string, unknown> = {}) => ({
  beachId: 'gordon', activity: 'swim', isAccurate, reason: isAccurate ? 'reason.goodWaves' : 'reason.badWind', reporterId: id(n), ...extra,
});

describe('בדיקת דיווח (validate)', () => {
  it('דיווח תקין עובר', () => expect(validateReport(report(1)).ok).toBe(true));
  it('חוף או פעילות לא מוכרים נדחים', () => {
    expect(validateReport(report(1, true, { beachId: 'miami' }))).toEqual({ ok: false, error: 'unknown_beach_or_activity' });
    expect(validateReport(report(1, true, { activity: 'fishing' }))).toEqual({ ok: false, error: 'unknown_beach_or_activity' });
  });
  it('אין טקסט חופשי: סיבה שלא ברשימה נדחית, וגם סיבה חיובית להצבעה שלילית', () => {
    expect(validateReport(report(1, true, { reason: 'כל טקסט שהוא' })).ok).toBe(false);
    expect(validateReport(report(1, false, { reason: 'reason.goodWaves' })).ok).toBe(false);
  });
  it('שדה נוסף (למשל מיקום) נדחה', () => {
    expect(validateReport(report(1, true, { lat: 32.1 }))).toEqual({ ok: false, error: 'unknown_field' });
  });
  it('מזהה מדווח חייב להיות UUID', () => {
    expect(validateReport(report(1, true, { reporterId: 'gal' })).ok).toBe(false);
  });
});

describe('שרת /api/reports', () => {
  it('שומר דיווחים וסופר נכון; מתחת ל-5 אין פירוט', async () => {
    const { post, get } = setup();
    for (let i = 1; i <= 3; i++) expect((await post(report(i))).status).toBe(201);
    expect(await get()).toEqual({ total: 3, positive: 0, topReasons: [] });
    await post(report(4, false));
    await post(report(5));
    expect(await get()).toEqual({ total: 5, positive: 4, topReasons: ['reason.goodWaves', 'reason.badWind'] });
  });
  it('דיווח אחד למדווח לכל חוף ופעילות: דיווח חדש מחליף', async () => {
    const { post, get } = setup();
    await post(report(1, true));
    await post(report(1, false));
    expect((await get()).total).toBe(1);
  });
  it('דיווחים ישנים מ-4 שעות לא נספרים', async () => {
    const { post, get } = setup();
    await post(report(1), NOW - 5 * 3_600_000);
    await post(report(2));
    expect((await get()).total).toBe(1);
  });
  it('מחיקה אוטומטית אחרי 7 ימים', async () => {
    const { db, post } = setup();
    await post(report(1), NOW - 8 * 24 * 3_600_000);
    await post(report(2));
    const rows = db.raw.prepare('SELECT COUNT(*) AS n FROM reports').get() as { n: number };
    expect(rows.n).toBe(1);
  });
  it('המזהה המקורי לא נשמר, רק hash', async () => {
    const { db, post } = setup();
    await post(report(7));
    const row = db.raw.prepare('SELECT reporter FROM reports').get() as { reporter: string };
    expect(row.reporter).not.toContain(id(7));
    expect(row.reporter).toMatch(/^[0-9a-f]{64}$/);
  });
  it('הגבלת קצב: יותר מ-20 דיווחים בשעה מאותו מדווח נחסמים', async () => {
    const { post } = setup();
    const places = ['gordon', 'herzliya', 'palmachim', 'netanya'].flatMap((b) => ['beach', 'swim', 'kids', 'surf', 'sup', 'sail'].map((a) => [b, a]));
    const statuses = [];
    for (const [beachId, activity] of places.slice(0, 21)) {
      statuses.push((await post({ beachId, activity, isAccurate: true, reason: null, reporterId: id(1) })).status);
    }
    expect(statuses.slice(0, 20).every((s) => s === 201)).toBe(true);
    expect(statuses[20]).toBe(429);
  });
  it('תקרה לכל חוף ופעילות: מזהים מתחלפים לא עוקפים את הגבלת הקצב', async () => {
    const { db, post } = setup();
    const insert = db.raw.prepare('INSERT INTO reports (id, beach_id, activity, vote, reason, reporter, created_at) VALUES (?, ?, ?, 1, NULL, ?, ?)');
    for (let i = 0; i < 300; i++) insert.run(`r${i}`, 'gordon', 'swim', `h${i}`, NOW - 1000);
    expect((await post(report(999))).status).toBe(429);
    expect((await post({ ...report(999), beachId: 'haifa' })).status).toBe(201);
  });
  it('בקשה מאתר אחר נחסמת, וגם גוף גדול מדי', async () => {
    const { post } = setup();
    expect((await post(report(1), NOW, { Origin: 'https://evil.example' })).status).toBe(403);
    expect((await post({ ...report(1), pad: 'x'.repeat(2000) })).status).toBe(413);
  });
  it('בלי מלח סודי מוגדר השרת מסרב לעבוד', async () => {
    const { db } = setup();
    const res = await handleReportsRequest(new Request(`${ORIGIN}/api/reports?beach=gordon&activity=swim`), { DB: db }, NOW);
    expect(res.status).toBe(500);
  });
});
