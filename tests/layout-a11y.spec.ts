// בדיקות פריסה ונגישות (FR-17): בלי גלילה אופקית, כפתורים בגודל 44 פיקסלים לפחות,
// בדיקת נגישות אוטומטית (axe) בשתי השפות, שתי עמודות במחשב, ורקע סטטי בהפחתת תנועה.
// רצות בשלושה גדלים: 360×800, 768×1024, 1280×800.
import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function onboard(page: Page) {
  // בלי אנימציות, כדי שבדיקת הניגודיות לא תמדוד טקסט באמצע הופעה הדרגתית
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-07-01T05:30:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: /חוף גורדון/ }).click();
  await page.getByRole('button', { name: /אילת/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'אולי אחר כך' }).click();
  await page.getByRole('button', { name: /שחייה/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();
  await expect(page.getByTestId('hero-score')).toBeVisible();
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'גלילה אופקית בעמוד').toBeLessThanOrEqual(0);
}

async function smallTargets(page: Page, scope: string) {
  return page.locator(`${scope} button:visible, ${scope} input:visible`).evaluateAll((els) =>
    els
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.width < 43.5 || r.height < 43.5))
      .map(({ el, r }) => `${el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30)} (${Math.round(r.width)}×${Math.round(r.height)})`),
  );
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => `${n.target.join(' ')} [${n.any[0]?.message ?? ''}]`).join(' | ')}`);
}

test('מסך ראשי ופירוט: פריסה, גודל כפתורים ונגישות, בעברית ובאנגלית', async ({ page }) => {
  await onboard(page);
  for (const lang of ['he', 'en']) {
    if (lang === 'en') await page.getByRole('button', { name: 'EN' }).click();
    await noHorizontalScroll(page);
    expect(await smallTargets(page, 'main'), `כפתורים קטנים מ-44 (${lang})`).toEqual([]);
    expect(await axe(page), `נגישות במסך הראשי (${lang})`).toEqual([]);

    await page.getByTestId('hero-score').scrollIntoViewIfNeeded();
    await page.locator('main').getByRole('button', { name: lang === 'he' ? /לנתונים המלאים/ : /Full data/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await noHorizontalScroll(page);
    expect(await smallTargets(page, '[role=dialog]'), `כפתורים קטנים במסך הפירוט (${lang})`).toEqual([]);
    expect(await axe(page), `נגישות במסך הפירוט (${lang})`).toEqual([]);
    await dialog.getByRole('button', { name: lang === 'he' ? 'חזרה' : 'Back' }).click();
    await expect(dialog).toHaveCount(0);
  }
});

test('במחשב: שתי עמודות, הטבלה השעתית ליד כרטיס הציון', async ({ page }, info) => {
  await onboard(page);
  const panel = page.getByTestId('desktop-hourly');
  if (info.project.name !== 'desktop') {
    await expect(panel).toHaveCount(0);
    return;
  }
  await expect(panel).toBeVisible();
  const hero = (await page.getByTestId('hero-score').boundingBox())!;
  const table = (await panel.boundingBox())!;
  // זה לצד זה: בלי חפיפה אופקית, והטבלה מתחילה לפני שהכרטיס נגמר
  expect(table.x >= hero.x + hero.width || table.x + table.width <= hero.x).toBe(true);
  expect(table.y).toBeLessThan(hero.y + hero.height);
  // הציון בכרטיס שווה לציון של "עכשיו" בטבלה שבעמודה השנייה
  const score = (await page.getByTestId('hero-score').innerText()).match(/(\d+)\/100/)![1];
  await expect(panel.getByTestId('current-hour-row').getByTestId('cell-score')).toHaveText(score);
});

test('הפחתת תנועה: הרקע לא זז', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await onboard(page);
  const transforms = () => page.locator('.fixed.-z-10 [style]').evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
  const before = await transforms();
  await page.clock.runFor(1500);
  await page.waitForTimeout(700);
  expect(await transforms()).toEqual(before);
});
