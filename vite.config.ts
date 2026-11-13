// הגדרות הבנייה של האתר (Vite).
// מתי נוגעים: כמעט אף פעם. אסור להוסיף כאן define או משתני סביבה עם מפתחות (כלל ברזל 3).
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

// מדיניות אבטחה לדפדפן: האתר רשאי לטעון ולפנות רק לכתובת שלו עצמו.
// כך גם אם בטעות יתווסף קוד שפונה לאינטרנט, הדפדפן יחסום אותו.
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

// מוסיף את המדיניות רק לאתר הבנוי (dist). בזמן פיתוח Vite צריך סקריפטים פנימיים.
function addSecurityPolicy(): Plugin {
  return {
    name: 'seavibes-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      const tag = `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`;
      return html.replace('<head>', `<head>\n    ${tag}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), addSecurityPolicy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
