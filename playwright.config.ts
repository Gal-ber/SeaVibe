// הגדרות בדיקת הדפדפן האוטומטית (Playwright).
// בונה את האתר, מריץ אותו על המחשב בלבד (127.0.0.1) ופותח אותו בדפדפן אוטומטי.
// מתי נוגעים: כשמוסיפים גדלי מסך או דפדפנים לבדיקה.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.ts',
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4173', serviceWorkers: 'block', locale: 'he-IL', timezoneId: 'Asia/Jerusalem' },
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'phone', use: { browserName: 'chromium', viewport: { width: 360, height: 800 } } },
    { name: 'tablet', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
  ],
});
