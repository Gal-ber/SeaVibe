// בדיקה: כפתור השפה מחליף את כל המסך לאנגלית ול-LTR בלי טעינה מחדש, הבחירה נשמרת,
// והחוף והפעילות נשארים. החיפוש מוצא את פלמחים גם באנגלית.
// מתי נוגעים: כשמשנים את כפתור השפה או את הכותרת.
import { test, expect } from '@playwright/test';

test('החלפת שפה לאנגלית ובחזרה', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-07-01T05:30:00Z'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: /חוף גורדון/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'אולי אחר כך' }).click();
  await page.getByRole('button', { name: /גלישה/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();
  const scoreHe = (await page.getByTestId('hero-score').innerText()).match(/\d+/)![0];

  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Gordon Beach' })).toBeVisible();
  await expect(page.getByTestId('hero-score')).toContainText(`Surfing vibe: ${scoreHe}/100`);
  await expect(page.getByTestId('hero-windSpeed')).toContainText('km/h');
  // אין עברית במסך, חוץ מכפתור "עב" עצמו
  const mainText = await page.locator('main').innerText();
  expect(mainText.replace('עב', '')).not.toMatch(/[\u0590-\u05FF]/);

  // הבחירה נשמרת אחרי רענון
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Gordon Beach' })).toBeVisible();

  // חיפוש באנגלית
  await page.getByRole('combobox', { name: 'Search beach' }).fill('palmachim');
  await page.getByRole('button', { name: /^Palmachim/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Palmachim' })).toBeVisible();

  // חזרה לעברית
  await page.getByRole('button', { name: 'עב' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1, name: 'פלמחים' })).toBeVisible();
});

test('חיפוש בלי תוצאה מציג הודעה ואת החופים הנתמכים, ו-Esc סוגר', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /חוף גורדון/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'אולי אחר כך' }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();

  const search = page.getByRole('combobox', { name: 'חיפוש חוף' });
  await search.fill('ניו יורק');
  await expect(page.getByTestId('search-empty')).toContainText('לא מצאנו חוף');
  await expect(page.getByTestId('search-empty').getByRole('button', { name: /אילת/ })).toBeVisible();
  await search.press('Escape');
  await expect(page.getByTestId('search-empty')).toHaveCount(0);
});
