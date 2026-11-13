// שער הנתונים: המקום היחיד שממנו המסכים מקבלים תחזיות.
// קורא את המתג dataMode מ-config/app.config.json.
// mock: קורא את קובץ הדוגמה /data/forecast.json מהאתר שלנו עצמו (לא מהאינטרנט).
// live: עדיין לא קיים (שלב 5). עד אז מחזיר "לא זמין" ולא פונה לשום מקום.
// זה הקובץ היחיד שמותר בו fetch, ורק לכתובת /data/ של האתר שלנו (נבדק ב-npm run check).
// מתי נוגעים: רק בשלב 5 (נתוני אמת), באישור הבעלים.
import appConfig from '../../config/app.config.json';
import { normalizeForecastFile } from './normalize';
import { NormalizedForecast } from './dataContract';

export type DataMode = 'mock' | 'live';

export interface ForecastResult {
  mode: DataMode;
  available: boolean;
  data: NormalizedForecast | null;
}

const MOCK_FILE = '/data/forecast.json';

export function getDataMode(): DataMode {
  return appConfig.dataMode === 'live' ? 'live' : 'mock';
}

export async function loadForecasts(): Promise<ForecastResult> {
  const mode = getDataMode();
  if (mode === 'live') return { mode, available: false, data: null };
  try {
    const response = await fetch(MOCK_FILE, { cache: 'no-store' });
    if (!response.ok) return { mode, available: false, data: null };
    const data = normalizeForecastFile(await response.json());
    return { mode, available: data !== null, data };
  } catch {
    return { mode, available: false, data: null };
  }
}
