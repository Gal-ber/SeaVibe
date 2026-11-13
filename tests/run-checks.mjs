// הפקודה npm run check: מריצה את כל הבדיקות ומדווחת בעברית אם הכול תקין.
// 1. אין כתובות חיצוניות או fetch בקוד המקור  2. בדיקת טיפוסים  3. בניית האתר
// 4. אין מפתחות באתר הבנוי  5. בדיקת דפדפן: אין בקשות החוצה  6. סריקת סודות (gitleaks)
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
const NETWORK_CALL = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(|new\s+(XMLHttpRequest|WebSocket|EventSource)\b/;

step('קוד המקור (src) לא פונה לאינטרנט', () =>
  filesIn('src').flatMap((file) => {
    const text = readFileSync(file, 'utf8').replace(ALLOWED_URL, '');
    const found = [];
    if (/https?:\/\//.test(text)) found.push(`${file}: נמצאה כתובת אינטרנט`);
    if (NETWORK_CALL.test(text)) found.push(`${file}: נמצאה קריאת רשת`);
    return found;
  })
);

step('בדיקת טיפוסים (TypeScript)', () => run('npx tsc --noEmit'));
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

step('בדיקת דפדפן: אין אף בקשה מחוץ למחשב', () => run('npx playwright test'));

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
