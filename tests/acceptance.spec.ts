// בדיקות הקבלה מפרק 15 ב-PRD (אלה שלא מכוסות בקבצים אחרים), והתקנה ושימוש בלי רשת (FR-18).
// מכוסות במקום אחר: גלישה משנה הכול (activity-switch), מיקום ומסורב (behavior), דיווחים (behavior),
// הפחתת תנועה (layout-a11y), טמפ׳ מים חסרה (data-consistency).
import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const forecast = JSON.parse(readFileSync('public/data/forecast.json', 'utf8'));

async function onboard(page: Page, israelTime = '2026-07-01T05:30:00Z') {
  await page.clock.setFixedTime(new Date(israelTime));
  await page.goto('/');
  await page.getByRole('button', { name: /חוף גורדון/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'אולי אחר כך' }).click();
  await page.getByRole('button', { name: /שחייה/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();
}

test('חיפוש פלמחים מציג אותו כחוף פעיל; חיפוש פעילות מדרג את החופים', async ({ page }) => {
  await onboard(page);
  const search = page.getByRole('combobox', { name: 'חיפוש חוף' });
  await search.fill('פלמחים');
  await page.getByRole('button', { name: /^פלמחים/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'פלמחים' })).toBeVisible();
  await expect(page.getByTestId('hero-score')).toContainText('שחייה');

  await search.fill('גלישה');
  await expect(page.getByTestId('ranked-heading')).toContainText('גלישה');
  const scores = (await page.getByTestId('ranked-score').allInnerTexts()).map((s) => Number(s));
  expect(scores).toHaveLength(7);
  expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  await page.getByTestId('ranked-score').first().click();
  await expect(page.getByTestId('hero-score')).toContainText(`גלישה: ${scores[0]}/100`);
});

test('לחיצה על "רוח" מציבה את עמודת הרוח ראשונה אחרי השעה, והתובנה משתנה', async ({ page }) => {
  await onboard(page);
  await page.locator('main').getByRole('button', { name: /לנתונים המלאים/ }).click();
  const dialog = page.getByRole('dialog');
  const headers = () => dialog.locator('th').evaluateAll((ths) => ths.map((th) => th.getAttribute('data-testid')));
  expect((await headers()).slice(0, 2)).toEqual(['col-time', 'col-waveHeight']);
  const wavesInsight = await dialog.getByTestId('hourly-insight').innerText();
  await dialog.getByRole('button', { name: /רוח/ }).first().click();
  expect((await headers()).slice(0, 2)).toEqual(['col-time', 'col-wind']);
  await expect(dialog.getByTestId('hourly-insight')).not.toHaveText(wavesInsight);
});

test('בשורת 14:00 כל ארבעת הנתונים שייכים לאותה שעה בקובץ', async ({ page }) => {
  await onboard(page, '2026-07-01T11:30:00Z'); // 14:30 שעון ישראל
  await page.locator('main').getByRole('button', { name: /לנתונים המלאים/ }).click();
  const row = page.getByRole('dialog').getByTestId('current-hour-row');
  await expect(row).toContainText('14:00');
  const f = forecast.beaches.find((b: { beachId: string }) => b.beachId === 'gordon').hours[14].fields;
  await expect(row.getByTestId('cell-airTemperature')).toHaveText(`${Math.round(f.airTemperature.value)}°`);
  await expect(row.getByTestId('cell-waterTemperature')).toHaveText(`${Math.round(f.waterTemperature.value)}°`);
  await expect(row.getByTestId('cell-waveHeight')).toHaveText(`${f.waveHeight.value.toFixed(1)} מ׳`);
  await expect(row.getByTestId('cell-windSpeed')).toHaveText(`${f.windSpeed.value} קמ״ש`);
});

test('מקור לא זמין: הודעה וכפתור "נסה שוב", בלי המלצה', async ({ page }) => {
  await page.route('**/data/forecast.json', (route) => route.fulfill({ status: 503, body: '' }));
  await onboard(page);
  await expect(page.getByRole('alert')).toContainText('הנתונים לא זמינים כרגע');
  await expect(page.getByTestId('hero-score')).toHaveCount(0);
  await page.unroute('**/data/forecast.json');
  await page.getByRole('button', { name: 'נסה שוב' }).click();
  await expect(page.getByTestId('hero-score')).toBeVisible();
});

test.describe('התקנה ושימוש בלי רשת', () => {
  test.use({ serviceWorkers: 'allow' });

  test('manifest תקין, והאתר נפתח בלי רשת עם "עודכן לפני"', async ({ page, context }) => {
    const manifest = await (await page.request.get('/manifest.webmanifest')).json();
    expect(manifest.name).toBe('SeaVibes');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));

    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await page.getByRole('button', { name: /חוף גורדון/ }).click();
    await page.getByRole('button', { name: 'המשך' }).click();
    await page.getByRole('button', { name: 'אולי אחר כך' }).click();
    await page.getByRole('button', { name: 'המשך' }).click();
    await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();
    await expect(page.getByTestId('hero-score')).toBeVisible();

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId('hero-score')).toBeVisible();
    await expect(page.getByTestId('offline-banner')).toContainText('אין חיבור לרשת');
    await context.setOffline(false);
  });
});
