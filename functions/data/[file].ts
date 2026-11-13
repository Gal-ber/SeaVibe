// הכתובת /data/forecast.json באתר הפרוס.
// במצב FORECAST_MODE = "live": מחזירה את התחזית האחרונה שנשמרה במסד, ואם היא ישנה מדי או חסרה, "לא זמין" (503).
// בכל מצב אחר: ממשיכה לקובץ נתוני הדוגמה הרגיל (public/data/forecast.json).
// מתי נוגעים: כשמשנים את מדיניות הגיל של התחזית (maxAgeHours בקובץ המקורות).
import sourcesConfig from '../../data-sources/sources.config.json';
import { D1Database } from '../../server/reports/d1';
import { latestSnapshot } from '../../server/forecast/store';

interface Context {
  params: { file?: string };
  env: { DB: D1Database; FORECAST_MODE?: string };
  next: () => Promise<Response>;
}

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

export async function serveForecast(context: Context, now: number): Promise<Response> {
  if (context.params.file !== 'forecast.json' || context.env.FORECAST_MODE !== 'live') return context.next();
  const snapshot = await latestSnapshot(context.env.DB);
  const maxAge = sourcesConfig.maxAgeHours * 3_600_000;
  if (!snapshot || now - snapshot.createdAt > maxAge) {
    return new Response(JSON.stringify({ error: snapshot ? 'stale' : 'no_data' }), { status: 503, headers });
  }
  return new Response(snapshot.body, { status: 200, headers });
}

export const onRequest = (context: Context) => serveForecast(context, Date.now());
