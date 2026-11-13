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
// הקבצים היחידים שמותר בהם fetch, וכל אחד רק לכתובת אחת באתר שלנו:
// שער הנתונים (/data/...) ושכבת הדיווחים (/api/reports).
const ALLOWED_FETCH = {
  [join('src', 'engine', 'dataGateway.ts')]: { constName: 'MOCK_FILE', prefix: '/data/' },
  [join('src', 'engine', 'reportsStore.ts')]: { constName: 'API', prefix: '/api/reports' },
};
const NETWORK_CALL = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(|new\s+(XMLHttpRequest|WebSocket|EventSource)\b/;

function checkAllowedFetch(file, text) {
  const { constName, prefix } = ALLOWED_FETCH[file];
  const value = text.match(new RegExp(`const ${constName} = '([^']*)'`))?.[1];
  const calls = [...text.matchAll(/\bfetch\s*\(\s*([^,)]*)/g)].map((m) => m[1].trim());
  const ok = value?.startsWith(prefix) && calls.length > 0 && calls.every((arg) => arg === constName || arg.startsWith('`${' + constName + '}'));
  return ok ? [] : [`${file}: מותר רק fetch ל-${prefix} דרך ${constName}`];
}

step('קוד המקור (src) לא פונה לאינטרנט', () =>
  filesIn('src').flatMap((file) => {
    const text = readFileSync(file, 'utf8').replace(ALLOWED_URL, '');
    const found = [];
    if (/https?:\/\//.test(text)) found.push(`${file}: נמצאה כתובת אינטרנט`);
    if (ALLOWED_FETCH[file]) found.push(...checkAllowedFetch(file, text));
    else if (NETWORK_CALL.test(text)) found.push(`${file}: נמצאה קריאת רשת`);
    return found;
  })
);

step('השרת (server/, functions/) לא פונה לשום כתובת', () =>
  [...filesIn('server'), ...filesIn('functions')].flatMap((file) => {
    const text = readFileSync(file, 'utf8');
    const found = [];
    if (/https?:\/\//.test(text)) found.push(`${file}: נמצאה כתובת אינטרנט`);
    if (NETWORK_CALL.test(text)) found.push(`${file}: נמצאה קריאת רשת`);
    return found;
  })
);

// כלל 8: הציון הוא נוחות, לא בטיחות. ניסוחים כאלה אסורים בטקסטים שהמשתמש רואה.
// כל הטקסט שהמשתמש רואה נמצא בקובצי השפה (נאכף בבדיקת FR-15), ולכן סורקים אותם.
const SAFETY_WORDS = /בטוח|סכנ|מסוכ|מומלץ להיכנס|טביע|\bsafe\b|\bdanger/i;
step('אין ניסוחי בטיחות בטקסטים (כלל 8)', () =>
  filesIn('config/texts').flatMap((file) =>
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

step('ה-service worker פונה רק לאתר שלנו (public/sw.js)', () => {
  const sw = readFileSync('public/sw.js', 'utf8');
  const problems = [];
  if (/https?:\/\//.test(sw)) problems.push('public/sw.js: נמצאה כתובת אינטרנט');
  if (!sw.includes('url.origin !== self.location.origin')) problems.push('public/sw.js: חסרה בדיקה שהבקשה לאתר שלנו בלבד');
  return problems;
});

// כלל 10: אין מודל שפה בחישוב. אין חבילות של מודלי שפה בפרויקט.
step('אין חבילות של מודל שפה (כלל 10)', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  return deps.filter((d) => /openai|anthropic|genai|langchain|cohere|mistral|ollama/i.test(d)).map((d) => `נמצאה חבילה: ${d}`);
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
