// טוען את התחזיות דרך שער הנתונים ומחזיר את מצב הטעינה (טוען / מוכן / לא זמין) ואת השעה הנוכחית.
// מתי נוגעים: כמעט אף פעם. הלוגיקה של מאיפה הנתונים מגיעים נמצאת ב-src/engine/dataGateway.ts.
import { useCallback, useEffect, useState } from 'react';
import { loadForecasts, ForecastResult, getDataMode } from '../engine/dataGateway';

export type ForecastStatus = 'loading' | 'ready' | 'unavailable';

export function useForecastData() {
  const [status, setStatus] = useState<ForecastStatus>('loading');
  const [result, setResult] = useState<ForecastResult>({ mode: getDataMode(), available: false, data: null });

  const reload = useCallback(() => {
    setStatus('loading');
    loadForecasts().then((r) => {
      setResult(r);
      setStatus(r.available ? 'ready' : 'unavailable');
    });
  }, []);

  useEffect(reload, [reload]);

  // השעון מתעדכן כל דקה, כדי שהכרטיס יעבור לשעה הבאה בזמן
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return { status, result, reload, now };
}
