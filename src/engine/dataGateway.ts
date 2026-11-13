// שער הנתונים: המקום היחיד שממנו המסכים מקבלים תחזיות.
// קורא את המתג dataMode מ-config/app.config.json.
// בשני המצבים קורא את /data/forecast.json מהאתר שלנו עצמו (לא מהאינטרנט):
// mock: קובץ נתוני הדוגמה. live: התחזית שהמשימה המתוזמנת שמרה (מוגש מהשרת שלנו, functions/data).
// האם להציג "נתוני דוגמה" נקבע לפי מה שכתוב בקובץ עצמו (dataMode), לא לפי ההגדרה. כך אין טעות בתווית.
// זה הקובץ היחיד שמותר בו fetch, ורק לכתובת /data/ של האתר שלנו (נבדק ב-npm run check).
// מתי נוגעים: כמעט אף פעם.
import appConfig from '../../config/app.config.json';
import { normalizeForecastFile } from './normalize';
import { NormalizedForecast } from './dataContract';

export type DataMode = 'mock' | 'live';

export interface ForecastResult {
  mode: DataMode;
  available: boolean;
  data: NormalizedForecast | null;
  // כשאין רשת והנתונים הגיעו מהעותק השמור במכשיר: מתי נשמרו. אחרת null.
  cachedAt: string | null;
}

const MOCK_FILE = '/data/forecast.json';

export function getDataMode(): DataMode {
  return appConfig.dataMode === 'live' ? 'live' : 'mock';
}

export async function loadForecasts(): Promise<ForecastResult> {
  const mode = getDataMode();
  try {
    const response = await fetch(MOCK_FILE, { cache: 'no-store' });
    if (!response.ok) return { mode, available: false, data: null, cachedAt: null };
    const data = normalizeForecastFile(await response.json());
    return { mode: data?.dataMode ?? mode, available: data !== null, data, cachedAt: response.headers.get('X-SeaVibes-Cached-At') };
  } catch {
    return { mode, available: false, data: null, cachedAt: null };
  }
}
