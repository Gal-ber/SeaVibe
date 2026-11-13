// בדיקה: לכל אחד מ-7 החופים, המספרים בכרטיס שווים לשורה של "עכשיו" בטבלה השעתית.
// בנוסף: נתון חסר (טמפ׳ המים באילת) מוצג "לא זמין", לא 0.
// מתי נוגעים: כשמוסיפים נתון חדש לכרטיס או לטבלה.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync('config/beaches.json', 'utf8')).beaches as { id: string; name: { he: string } }[];
const FIELDS = ['airTemperature', 'waterTemperature', 'waveHeight', 'windSpeed'];

test('ערכי הכרטיס שווים לשעה הנוכחית בטבלה, בכל החופים', async ({ page }) => {
  await page.goto('/');
  for (const beach of catalog) await page.getByRole('button', { name: new RegExp(beach.name.he) }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'אולי אחר כך' }).click();
  await page.getByRole('button', { name: /שחייה/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();

  for (const beach of catalog) {
    await page.getByTestId(`favorite-${beach.id}`).click();
    await expect(page.getByRole('heading', { level: 1, name: beach.name.he })).toBeVisible();
    await expect(page.getByTestId('card-mock-badge')).toBeVisible();

    const hero: Record<string, string> = {};
    for (const f of FIELDS) hero[f] = (await page.getByTestId(`hero-${f}`).innerText()).trim();

    await page.getByRole('button', { name: /לנתונים המלאים/ }).click();
    const row = page.getByTestId('current-hour-row');
    await expect(row).toBeVisible();
    for (const f of FIELDS) {
      await expect(row.getByTestId(`cell-${f}`), `${beach.id} / ${f}`).toHaveText(hero[f]);
    }
    if (beach.id === 'eilat') expect(hero.waterTemperature).toBe('לא זמין');

    await page.getByRole('button', { name: 'חזרה' }).click();
    await expect(row).toHaveCount(0);
  }
});
