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
