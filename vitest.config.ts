// הגדרות בדיקות היחידה (Vitest). רק הקבצים ב-tests/unit. בדיקות הדפדפן רצות ב-Playwright.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
