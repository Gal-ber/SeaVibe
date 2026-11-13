// שער הנתונים: המקום היחיד שממנו המסכים מקבלים תחזיות.
// קורא את המתג dataMode מ-config/app.config.json.
// mock: מחזיר את נתוני הדוגמה שבקוד. אין כאן שום פנייה לאינטרנט.
// live: עדיין לא קיים (שלב 5). עד אז מחזיר "לא זמין" ולא פונה לשום מקום.
// מתי נוגעים: רק בשלב 1 (קבצי נתונים) ובשלב 5 (נתוני אמת), באישור הבעלים.
import appConfig from '../../config/app.config.json';
import { BEACHES } from '../data/beaches';
import { BeachForecast } from '../types';

export type DataMode = 'mock' | 'live';

export interface ForecastResult {
  mode: DataMode;
  available: boolean;
  forecasts: Record<string, BeachForecast>;
}

export function getDataMode(): DataMode {
  return appConfig.dataMode === 'live' ? 'live' : 'mock';
}

export function loadForecasts(): ForecastResult {
  const mode = getDataMode();
  if (mode === 'live') {
    // מצב אמת עוד לא מחובר. לא ממציאים נתונים ולא פונים לרשת.
    return { mode, available: false, forecasts: {} };
  }
  const forecasts: Record<string, BeachForecast> = {};
  for (const beach of BEACHES) forecasts[beach.id] = beach.forecast;
  return { mode, available: true, forecasts };
}
