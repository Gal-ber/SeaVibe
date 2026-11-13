// הפקודה npm run check: מריצה את כל הבדיקות ומדווחת בעברית אם הכול תקין.
// 1. אין כתובות חיצוניות או fetch בקוד המקור  2. בדיקת טיפוסים  3. בניית האתר
// 3א. בדיקות יחידה  4. אין מפתחות באתר הבנוי  5. בדיקות דפדפן  6. סריקת סודות (gitleaks)
// מתי נוגעים: כשמוסיפים בדיקה חדשה.
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const results = [];

function filesIn(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? filesIn(full) : [full];
  });
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function step(title, fn) {
  console.log(`\n▶ ${title}`);
  try {
    const problems = fn() || [];
    if (problems.length) throw new Error(problems.join('\n'));
    results.push({ title, ok: true });
  } catch (err) {
    results.push({ title, ok: false, detail: err.message });
  }
}

// כתובות שמותר שיופיעו כטקסט (לא בקשות רשת): מרחב השמות של SVG.
const ALLOWED_URL = /https?:\/\/www\.w3\.org\//g;
// הקובץ היחיד שמותר בו fetch: שער הנתונים, ורק לקבצים /data/ של האתר שלנו.
const GATEWAY = join('src', 'engine', 'dataGateway.ts');
const NETWORK_CALL = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(|new\s+(XMLHttpRequest|WebSocket|EventSource)\b/;

step('קוד המקור (src) לא פונה לאינטרנט', () =>
  filesIn('src').flatMap((file) => {
    const text = readFileSync(file, 'utf8').replace(ALLOWED_URL, '');
    const found = [];
    if (/https?:\/\//.test(text)) found.push(`${file}: נמצאה כתובת אינטרנט`);
    if (file === GATEWAY) {
      const targets = [...text.matchAll(/const MOCK_FILE = '([^']*)'/g)].map((m) => m[1]);
      const calls = (text.match(/\bfetch\s*\(/g) || []).length;
      if (calls !== 1 || targets.length !== 1 || !targets[0].startsWith('/data/') || !/fetch\(MOCK_FILE\b/.test(text)) {
        found.push(`${file}: מותר רק fetch אחד, לקובץ /data/ של האתר שלנו`);
      }
    } else if (NETWORK_CALL.test(text)) found.push(`${file}: נמצאה קריאת רשת`);
    return found;
  })
);

step('בדיקת טיפוסים (TypeScript)', () => run('npx tsc --noEmit'));
step('בדיקות יחידה (נתונים, ערכים חסרים, מנוע)', () => run('npx vitest run'));
step('בניית האתר', () => run('npx vite build'));

const SECRET_PATTERNS = [
  [/AIza[0-9A-Za-z_\-]{35}/, 'מפתח Google'],
  [/GEMINI/i, 'אזכור Gemini'],
  [/API_KEY/, 'שם משתנה של מפתח'],
  [/sk-[A-Za-z0-9_\-]{20,}/, 'מפתח בסגנון sk-'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'מפתח פרטי'],
  [/process\.env/, 'משתני סביבה בתוך האתר'],
];

step('אין מפתחות או סודות באתר הבנוי (dist)', () =>
  filesIn('dist').flatMap((file) => {
    if (!/\.(js|css|html|json|txt|map)$/.test(file)) return [];
    const text = readFileSync(file, 'utf8');
    return SECRET_PATTERNS.filter(([re]) => re.test(text)).map(([, name]) => `${file}: ${name}`);
  })
);

step('בדיקת דפדפן: אין בקשות החוצה, והכרטיס תואם לטבלה', () => run('npx playwright test'));

step('סריקת סודות (gitleaks)', () => {
  try {
    execSync('gitleaks version', { stdio: 'ignore' });
  } catch {
    return ['gitleaks לא מותקן. התקנה: brew install gitleaks'];
  }
  run('gitleaks dir . --config .gitleaks.toml --no-banner --redact');
});

console.log('\n================ סיכום ================');
for (const r of results) {
  console.log(`${r.ok ? '✔' : '✘'} ${r.title}`);
  if (!r.ok && r.detail) console.log(`   ${r.detail.split('\n').join('\n   ')}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n✘ ${failed} בדיקות נכשלו. לא לסיים עד שהכול עובר.` : '\n✔ הכול תקין.');
process.exit(failed ? 1 : 0);
