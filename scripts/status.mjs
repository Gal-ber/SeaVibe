// דוח מצב קצר בעברית: מתי נמשכה התחזית האחרונה, כמה קריאות למקור היום, וכמה דיווחי שטח יש.
// הפעלה: npm run status. קורא מהמסד ב-Cloudflare דרך הכלי wrangler (צריך להיות מחובר). לא משנה כלום.
import { execFileSync } from 'node:child_process';

function query(sql) {
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'seavibes-reports', '--remote', '--json', '--command', sql], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return JSON.parse(out)[0].results;
}

const today = new Date().toISOString().slice(0, 10);
const [snap] = query('SELECT MAX(created_at) AS last, COUNT(*) AS n FROM forecast_snapshots');
const [calls] = query(`SELECT COALESCE((SELECT calls FROM fetch_log WHERE day = '${today}'), 0) AS calls`);
const [reports] = query('SELECT COUNT(*) AS total, SUM(created_at >= ' + (Date.now() - 4 * 3_600_000) + ') AS recent FROM reports');

const ageHours = snap.last ? (Date.now() - snap.last) / 3_600_000 : null;
const when = snap.last ? new Date(snap.last).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) : 'אף פעם';
console.log('\n=== מצב SeaVibes ===');
console.log(`תחזית אחרונה: ${when}${ageHours !== null ? ` (לפני ${ageHours.toFixed(1)} שעות)` : ''}`);
console.log(ageHours !== null && ageHours <= 7 ? '✔ התחזית עדכנית' : '✘ התחזית ישנה או חסרה: האתר מציג "לא זמין". לבדוק את המשימה המתוזמנת');
console.log(`קריאות ל-Open-Meteo היום (UTC): ${calls.calls} מתוך 100 (בלם)`);
console.log(`עותקי תחזית שמורים: ${snap.n}`);
console.log(`דיווחי שטח: ${reports.total} בסך הכול, ${reports.recent ?? 0} ב-4 השעות האחרונות\n`);
