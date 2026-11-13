// כפתור "חזרה" של הטלפון (או של הדפדפן) סוגר חלון פתוח במקום לצאת מהאפליקציה.
// כשהחלון נפתח מוסיפים רשומה להיסטוריה. כל סגירה (כפתור, Esc או "חזרה") עוברת דרך ההיסטוריה,
// כך שיש מקור אמת אחד, וההיסטוריה נשארת נקייה.
// מחזיר את הפונקציה requestClose, שבה משתמשים בכפתורי הסגירה.
// מתי נוגעים: כשמוסיפים חלון חדש שצריך להיסגר ב"חזרה".
import { useCallback, useEffect, useRef } from 'react';

export function useBackToClose(open: boolean, onClose: () => void) {
  const pushed = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (open && !pushed.current) {
      window.history.pushState({ seavibesOverlay: true }, '');
      pushed.current = true;
    }
  }, [open]);

  useEffect(() => {
    const onPop = () => {
      if (!pushed.current) return;
      pushed.current = false;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return useCallback(() => {
    if (pushed.current) window.history.back(); // הסגירה עצמה תקרה ב-popstate
    else closeRef.current();
  }, []);
}
