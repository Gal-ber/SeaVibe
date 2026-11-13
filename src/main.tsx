// מפעיל את האתר: עוטף את כל המסכים בספק השפה (עברית / אנגלית).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import MotionSettings from './components/MotionSettings';
import { I18nProvider } from './i18n/I18nProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionSettings>
      <I18nProvider>
        <App />
      </I18nProvider>
    </MotionSettings>
  </StrictMode>,
);

// התקנה למסך הבית ופתיחה בלי רשת: רק באתר הבנוי, לא בזמן פיתוח
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // בלי service worker האתר עדיין עובד, רק לא בלי רשת
    });
  });
}
