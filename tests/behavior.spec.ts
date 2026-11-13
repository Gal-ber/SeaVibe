// בדיקות התנהגות (שלב 3ג): מיקום מאושר ומסורב, מועדף ראשי, דיווחי שטח, הבהרת הבטיחות, דילוג בפתיחה.
import { test, expect, Page } from '@playwright/test';

async function onboard(page: Page, beaches = ['חוף גורדון']) {
  await page.clock.setFixedTime(new Date('2026-07-01T05:30:00Z'));
  await page.goto('/');
  await expect(page.getByTestId('disclaimer')).toBeVisible();
  for (const b of beaches) await page.getByRole('button', { name: new RegExp(b) }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'אולי אחר כך' }).click();
  await page.getByRole('button', { name: /שחייה/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();
  await expect(page.getByTestId('hero-score')).toBeVisible();
}

test('מיקום מאושר: מוצג החוף הקרוב, ובכניסה הבאה בלי בקשה חוזרת', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 32.81, longitude: 34.96 }); // ליד חיפה
  await onboard(page);
  await page.getByRole('button', { name: 'אפשר מיקום' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'חיפה' })).toBeVisible();
  await expect(page.getByTestId('nearest-beach')).toContainText('חיפה');
  await expect(page.getByRole('button', { name: 'אפשר מיקום' })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'חיפה' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'אפשר מיקום' })).toHaveCount(0);
  // הקואורדינטות לא נשמרות במכשיר
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain('32.81');
  expect(stored).not.toContain('34.96');
});

test('מיקום מסורב: הודעה, חזרה למועדף הראשי, ובלי בקשה חוזרת', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'אפשר מיקום' }).click();
  await expect(page.getByText('לא קיבלנו גישה למיקום')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'חוף גורדון' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'חוף גורדון' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'אפשר מיקום' })).toHaveCount(0);
});

test('מועדף ראשי: בחירה, שמירה, והסרה מעבירה לבא בתור', async ({ page }) => {
  await onboard(page, ['חוף גורדון', 'אילת']);
  await expect(page.getByTestId('primary-badge')).toBeVisible();
  await page.getByTestId('favorite-eilat').click();
  await page.getByRole('button', { name: 'קבע כחוף ראשי' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'אילת' })).toBeVisible();
  await expect(page.getByTestId('primary-badge')).toBeVisible();
  await page.locator('main').getByRole('button', { name: 'הסרה מהמועדפים' }).first().click();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'חוף גורדון' })).toBeVisible();
});

test('דיווח שטח: נשמר במכשיר, נספר נכון, אפשר לשנות, והציון לא משתנה', async ({ page }) => {
  await onboard(page);
  const scoreBefore = await page.getByTestId('hero-score').innerText();
  await page.locator('main').getByRole('button', { name: /לנתונים המלאים/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByTestId('disclaimer')).toBeVisible();
  await expect(dialog.getByTestId('reports-summary')).toHaveText('עדיין אין מספיק דיווחים מהשטח');
  await dialog.getByRole('button', { name: '👍 מתאים' }).click();
  await dialog.getByRole('button', { name: 'גלים טובים' }).click();
  await expect(dialog.getByTestId('reports-summary')).toContainText('מעט דיווחים (1)');
  await expect(dialog.getByTestId('reports-summary')).not.toContainText('%');

  await page.reload();
  await page.locator('main').getByRole('button', { name: /לנתונים המלאים/ }).click();
  await expect(dialog.getByTestId('reports-your-vote')).toHaveText('דיווחת: מתאים');
  await dialog.getByRole('button', { name: 'שינוי הדיווח' }).click();
  await dialog.getByRole('button', { name: '👎 לא מתאים' }).click();
  await dialog.getByRole('button', { name: 'דלג' }).click();
  // דיווח אחד בלבד לחוף ופעילות: עדיין 1, לא 2
  await expect(dialog.getByTestId('reports-summary')).toContainText('מעט דיווחים (1)');
  await dialog.getByRole('button', { name: 'חזרה' }).click();
  await expect(page.getByTestId('hero-score')).toHaveText(scoreBefore);
});

test('ליד הציון מוצגת הערה שהוא ניסיוני, כל עוד הספים לא כוילו', async ({ page }) => {
  await onboard(page);
  await expect(page.getByTestId('score-experimental')).toContainText('ציון ניסיוני');
});

test('אפשר לדלג על כל שלבי הפתיחה', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'דלג' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();
  await expect(page.getByRole('heading', { name: 'איזה חוף בודקים היום?' })).toBeVisible();
});

test('חלון "פרטיות ותנאים": נפתח מהפתיחה ומהמסך הראשי, ונסגר ב-Esc', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'פרטיות ותנאים' }).click();
  const dialog = page.getByRole('dialog', { name: 'פרטיות ותנאים' });
  await expect(dialog).toContainText('אין פרסומות');
  await expect(dialog).toContainText('נמחקים אוטומטית אחרי 7 ימים');
  await expect(dialog).toContainText('Open-Meteo.com');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await onboard(page);
  await page.getByRole('button', { name: 'פרטיות ותנאים' }).click();
  await expect(page.getByRole('dialog', { name: 'פרטיות ותנאים' })).toContainText('אינו אישור בטיחות');
  await page.getByRole('button', { name: 'סגירה' }).click();
  await expect(page.getByRole('dialog', { name: 'פרטיות ותנאים' })).toHaveCount(0);
});
