// בדיקה: החלפת פעילות משנה בבת אחת את הציון, ההסבר, חלון הזמן וציוני הטבלה,
// והציון בכרטיס שווה לציון של "עכשיו" בטבלה.
// מתי נוגעים: כשמשנים את כרטיס הציון או את הטבלה.
import { test, expect, Page } from '@playwright/test';

async function snapshot(page: Page) {
  const score = (await page.getByTestId('hero-score').innerText()).match(/(\d+)\/100/)![1];
  return {
    score,
    explanation: await page.getByTestId('hero-explanation').innerText(),
    window: await page.getByTestId('hero-window').innerText(),
  };
}

async function tableScores(page: Page) {
  await page.getByRole('button', { name: /לנתונים המלאים/ }).click();
  const scores = await page.getByTestId('cell-score').allInnerTexts();
  const now = await page.getByTestId('current-hour-row').getByTestId('cell-score').innerText();
  await page.getByRole('button', { name: 'חזרה' }).click();
  await expect(page.getByTestId('current-hour-row')).toHaveCount(0);
  return { scores, now };
}

test('בחירת גלישה משנה ציון, הסבר, חלון וטבלה בבת אחת', async ({ page }) => {
  // שעון קבוע (08:30 שעון ישראל), כדי שהבדיקה לא תלויה בשעה שבה מריצים אותה
  await page.clock.setFixedTime(new Date('2026-07-01T05:30:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: /חוף גורדון/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'אולי אחר כך' }).click();
  await page.getByRole('button', { name: /שחייה/ }).click();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByRole('button', { name: 'בוא נבדוק את הים' }).click();

  const swim = await snapshot(page);
  const swimTable = await tableScores(page);
  expect(swimTable.now).toBe(swim.score);

  await page.locator('#activity-surf').click();
  const surf = await snapshot(page);
  const surfTable = await tableScores(page);
  expect(surfTable.now).toBe(surf.score);

  expect(surf.score).not.toBe(swim.score);
  expect(surf.explanation).not.toBe(swim.explanation);
  expect(surf.window).not.toBe(swim.window);
  expect(surfTable.scores).not.toEqual(swimTable.scores);
});
