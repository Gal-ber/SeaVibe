// בדיקה: האתר עובד מתחילתו ועד סופו בלי אף בקשה לכתובת מחוץ למחשב.
// כל בקשת רשת נרשמת. אם אחת מהן יוצאת החוצה, הבדיקה נכשלת ומדפיסה את הכתובת.
// מתי נוגעים: כשמוסיפים מסך חדש. כדאי להוסיף אותו גם למסלול כאן.
import { test, expect } from '@playwright/test';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

test('אין בקשות לדומיין חיצוני במצב mock', async ({ page }) => {
  const external: string[] = [];
  const securityErrors: string[] = [];

  page.on('request', (req) => {
    const url = new URL(req.url());
    const isLocal = url.protocol === 'data:' || url.protocol === 'blob:' || LOCAL_HOSTS.has(url.hostname);
    if (!isLocal) external.push(req.url());
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) securityErrors.push(msg.text());
  });

  await page.goto('/');
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);

  // מסך הפתיחה: חוף, דילוג על מיקום, פעילות, סיום
  await page.getByRole('button', { name: /חוף גורדון/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'אולי אחר כך' }).click();
  await page.getByRole('button', { name: /גלישה/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();

  // המסך הראשי: תגית נתוני דוגמה, החלפת פעילות, מסך פירוט
  await expect(page.getByText('נתוני דוגמה').first()).toBeVisible();
  await page.locator('#activity-swim').click();
  await page.getByRole('button', { name: /לנתונים המלאים/ }).click();
  await page.waitForTimeout(1500);

  expect(external, 'בקשות שיצאו מהמחשב').toEqual([]);
  expect(securityErrors, 'חסימות של מדיניות האבטחה').toEqual([]);
});
