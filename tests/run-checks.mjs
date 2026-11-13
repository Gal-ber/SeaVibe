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

// כלל 8: הציון הוא נוחות, לא בטיחות. ניסוחים כאלה אסורים בטקסטים שהמשתמש רואה.
const SAFETY_WORDS = /בטוח|סכנ|מסוכ|מומלץ להיכנס|טביע|\bsafe\b|\bdanger/i;
step('אין ניסוחי בטיחות בטקסטים (כלל 8)', () =>
  [...filesIn('src'), ...filesIn('config/texts')].flatMap((file) =>
    readFileSync(file, 'utf8').split('\n').flatMap((line, i) =>
      SAFETY_WORDS.test(line) && !line.includes('SAFETY_WORDS') ? [`${file}:${i + 1}: ${line.trim().slice(0, 80)}`] : []
    )
  )
);

// FR-15: כל טקסט בקובצי השפה. בקוד מותרות אותיות עבריות רק בהערות.
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
step('אין טקסט עברי בקוד, רק בקובצי השפה (FR-15)', () =>
  filesIn('src').flatMap((file) =>
    stripComments(readFileSync(file, 'utf8')).split('\n').flatMap((line, i) =>
      /[\u0590-\u05FF]/.test(line) ? [`${file}:${i + 1}: ${line.trim().slice(0, 80)}`] : []
    )
  )
);

step('לכל מפתח טקסט יש תרגום בשתי השפות (FR-15)', () => {
  const he = Object.keys(JSON.parse(readFileSync('config/texts/he.json', 'utf8')));
  const en = Object.keys(JSON.parse(readFileSync('config/texts/en.json', 'utf8')));
  return [...he.filter((k) => !en.includes(k)).map((k) => `חסר באנגלית: ${k}`), ...en.filter((k) => !he.includes(k)).map((k) => `חסר בעברית: ${k}`)];
});

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
