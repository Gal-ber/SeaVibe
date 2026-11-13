// צילומי מסך לסקירת הבעלים (שער האישור של שלב 3): כל המסכים, בעברית ובאנגלית, בשלושה גדלים.
// הפעלה: npm run screenshots. התוצאה: docs/screenshots/index.html (פותחים בדפדפן).
// עובד רק מול האתר הבנוי על המחשב (127.0.0.1). לא פונה לאינטרנט.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'docs/screenshots';
const BASE = 'http://127.0.0.1:4174';
const SIZES = { phone: [360, 800], tablet: [768, 1024], desktop: [1280, 800] };
const LANGS = {
  he: { locale: 'he-IL', beach: /חוף גורדון/, eilat: /אילת/, next: 'המשך', later: 'אולי אחר כך', act: /שחייה/, go: 'בוא נבדוק את הים', details: /לנתונים המלאים/ },
  en: { locale: 'en-US', beach: /Gordon/, eilat: /Eilat/, next: 'Next', later: 'Maybe later', act: /Swimming/, go: "Let's check the sea", details: /Full data/ },
};
const SHOTS = [
  ['1-onboarding', 'מסך פתיחה'],
  ['2-home', 'מסך ראשי'],
  ['3-detail', 'מסך פירוט'],
];

mkdirSync(OUT, { recursive: true });
const server = spawn('npx', ['vite', 'preview', '--port=4174', '--host=127.0.0.1', '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch();
try {
  for (const [lang, L] of Object.entries(LANGS)) {
    for (const [size, [w, h]] of Object.entries(SIZES)) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, locale: L.locale, reducedMotion: 'reduce' });
      await page.clock.setFixedTime(new Date('2026-07-01T05:30:00Z')); // 08:30 שעון ישראל
      await page.goto(BASE);
      await page.screenshot({ path: `${OUT}/${lang}-${size}-1-onboarding.png`, fullPage: true });
      await page.getByRole('button', { name: L.beach }).click();
      await page.getByRole('button', { name: L.eilat }).click();
      await page.getByRole('button', { name: L.next }).click();
      await page.getByRole('button', { name: L.later }).click();
      await page.getByRole('button', { name: L.act }).click();
      await page.getByRole('button', { name: L.next }).click();
      await page.getByRole('button', { name: L.go }).click();
      await page.getByTestId('hero-score').waitFor();
      await page.screenshot({ path: `${OUT}/${lang}-${size}-2-home.png`, fullPage: true });
      // מסך הפירוט נגלל בתוך חלון, לכן מגדילים את הגובה כדי לצלם את כולו
      await page.setViewportSize({ width: w, height: 4200 });
      await page.locator('main').getByRole('button', { name: L.details }).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}/${lang}-${size}-3-detail.png` });
      await page.close();
      console.log(`✔ ${lang} ${size}`);
    }
  }
} finally {
  await browser.close();
  server.kill();
}

const cards = Object.keys(LANGS).flatMap((lang) =>
  SHOTS.map(([id, title]) => `
  <section><h2>${title} · ${lang === 'he' ? 'עברית' : 'English'}</h2><div class="row">
    ${Object.keys(SIZES).map((s) => `<figure><figcaption>${s}</figcaption><a href="${lang}-${s}-${id}.png"><img loading="lazy" src="${lang}-${s}-${id}.png" alt="${title} ${lang} ${s}"></a></figure>`).join('')}
  </div></section>`),
);
writeFileSync(`${OUT}/index.html`, `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><title>SeaVibes · צילומי מסך</title>
<style>body{font-family:system-ui;margin:24px;background:#f8fafc;color:#0f172a}h1{margin:0 0 4px}p{color:#475569}
section{margin:32px 0}.row{display:flex;gap:16px;align-items:flex-start;overflow-x:auto}figure{margin:0;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:8px}
figcaption{font:600 12px system-ui;color:#475569;margin-bottom:6px}img{display:block;width:260px;height:auto;border-radius:6px}</style>
<h1>SeaVibes · צילומי מסך לסקירה</h1><p>שעה מדומה: 08:30 שעון ישראל. נתוני דוגמה. לחיצה על תמונה פותחת אותה בגודל מלא.</p>
${cards.join('')}</html>`);
console.log(`✔ ${OUT}/index.html`);
