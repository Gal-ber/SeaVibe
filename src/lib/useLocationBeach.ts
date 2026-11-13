// מנהל את בקשת המיקום במסך הראשי (FR-2, FR-3).
// אם המשתמש כבר אישר בעבר: מאתרים בשקט בכניסה ומציגים את החוף הקרוב.
// סירוב נשמר ולא מפעיל בקשה חוזרת. הדגל "הרשאה ניתנה" נדלק רק אם הדפדפן אישר בפועל.
// מתי נוגעים: כשמשנים מתי מבקשים מיקום.
import { useEffect, useRef, useState } from 'react';
import { dismissLocation, findNearestBeach, isLocationDismissed } from './location';
import type { LocationState } from '../components/LocationPermissionCard';

export function useLocationBeach(granted: boolean, setGranted: (g: boolean) => void, onBeach: (id: string) => void) {
  const [state, setState] = useState<LocationState>('idle');
  const [dismissed, setDismissed] = useState(isLocationDismissed);
  const [nearestId, setNearestId] = useState<string | null>(null);
  const started = useRef(false);

  const request = async () => {
    setState('requesting');
    const result = await findNearestBeach();
    if ('beachId' in result) {
      setGranted(true);
      setNearestId(result.beachId);
      onBeach(result.beachId);
      setState('idle');
      return;
    }
    setState(result.reason);
    if (result.reason === 'denied') {
      setGranted(false);
      dismissLocation();
    }
  };

  useEffect(() => {
    if (granted && !started.current) {
      started.current = true;
      request();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granted]);

  const dismiss = () => {
    dismissLocation();
    setDismissed(true);
  };

  return { state, dismissed, nearestId, request, dismiss };
}
