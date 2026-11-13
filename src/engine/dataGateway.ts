// שער הנתונים: המקום היחיד שממנו המסכים מקבלים תחזיות.
// קורא את המתג dataMode מ-config/app.config.json.
// בשני המצבים קורא את /data/forecast.json מהאתר שלנו עצמו (לא מהאינטרנט):
// mock: קובץ נתוני הדוגמה. live: התחזית שהמשימה המתוזמנת שמרה (מוגש מהשרת שלנו, functions/data).
// האם להציג "נתוני דוגמה" נקבע לפי מה שכתוב בקובץ עצמו (dataMode), לא לפי ההגדרה. כך אין טעות בתווית.
// זה הקובץ היחיד שמותר בו fetch, ורק לכתובת /data/ של האתר שלנו (נבדק ב-npm run check).
// מתי נוגעים: כמעט אף פעם.
import appConfig from '../../config/app.config.json';
import sourcesConfig from '../../data-sources/sources.config.json';
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

const MAX_AGE_MS = sourcesConfig.maxAgeHours * 3_600_000;
export const isTooOld = (generatedAt: string | null, now: number) => !generatedAt || now - new Date(generatedAt).getTime() > MAX_AGE_MS;

export async function loadForecasts(now = Date.now()): Promise<ForecastResult> {
  const mode = getDataMode();
  try {
    const response = await fetch(MOCK_FILE, { cache: 'no-store' });
    if (!response.ok) return { mode, available: false, data: null, cachedAt: null };
    const data = normalizeForecastFile(await response.json());
    // תחזית אמת ישנה מדי (למשל עותק שמור במכשיר) לא מוצגת: "לא זמין" ולא המלצה ישנה
    const tooOld = data?.dataMode === 'live' && isTooOld(data.generatedAt, now);
    return { mode: data?.dataMode ?? mode, available: data !== null && !tooOld, data: tooOld ? null : data, cachedAt: response.headers.get('X-SeaVibes-Cached-At') };
  } catch {
    return { mode, available: false, data: null, cachedAt: null };
  }
}
