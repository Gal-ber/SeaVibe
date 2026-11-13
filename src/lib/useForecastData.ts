// טוען את התחזיות דרך שער הנתונים ומחזיר את מצב הטעינה (טוען / מוכן / לא זמין) ואת השעה הנוכחית.
// מתי נוגעים: כמעט אף פעם. הלוגיקה של מאיפה הנתונים מגיעים נמצאת ב-src/engine/dataGateway.ts.
import { useCallback, useEffect, useState } from 'react';
import { loadForecasts, ForecastResult, getDataMode } from '../engine/dataGateway';

export type ForecastStatus = 'loading' | 'ready' | 'unavailable';

const REFRESH_MS = 30 * 60_000;

export function useForecastData() {
  const [status, setStatus] = useState<ForecastStatus>('loading');
  const [result, setResult] = useState<ForecastResult>({ mode: getDataMode(), available: false, data: null, cachedAt: null });

  const reload = useCallback(() => {
    setStatus('loading');
    loadForecasts().then((r) => {
      setResult(r);
      setStatus(r.available ? 'ready' : 'unavailable');
    });
  }, []);

  useEffect(reload, [reload]);

  // התחזית האמיתית מתעדכנת כל 3 שעות: טוענים מחדש כל 30 דקות, וגם כשחוזרים לאפליקציה אחרי זמן.
  // הטעינה החוזרת שקטה (בלי מסך טעינה). אם המקור לא זמין, מוצג "לא זמין" ולא נשארת המלצה ישנה.
  useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      last = Date.now();
      loadForecasts().then((r) => {
        setResult(r);
        setStatus(r.available ? 'ready' : 'unavailable');
      });
    };
    const timer = setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - last > REFRESH_MS) refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // השעון מתעדכן כל דקה, כדי שהכרטיס יעבור לשעה הבאה בזמן
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return { status, result, reload, now };
}
