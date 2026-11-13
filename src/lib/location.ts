// מיקום (FR-2, FR-3): מבקשים מהדפדפן רק אחרי לחיצה של המשתמש, מחשבים את החוף הנתמך הקרוב,
// ומחזירים רק את מזהה החוף. הקואורדינטות לא נשמרות ולא נשלחות לשום מקום.
// מיקום מחוץ לישראל: מוחזר החוף הנתמך הקרוב ביותר (לא ממציאים חוף).
// מתי נוגעים: כשמשנים את אופן בחירת החוף הקרוב.
import { BEACHES } from '../data/beaches';
import { getDistance } from './utils';

export type LocationResult = { ok: true; beachId: string } | { ok: false; reason: 'denied' | 'unavailable' };

export function nearestBeachId(lat: number, lng: number): string {
  let best = BEACHES[0];
  for (const beach of BEACHES) {
    if (getDistance(lat, lng, beach.lat, beach.lng) < getDistance(lat, lng, best.lat, best.lng)) best = beach;
  }
  return best.id;
}

export function findNearestBeach(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ ok: false, reason: 'unavailable' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      // הקואורדינטות משמשות רק לחישוב הזה, ואז נזרקות
      (position) => resolve({ ok: true, beachId: nearestBeachId(position.coords.latitude, position.coords.longitude) }),
      (error) => resolve({ ok: false, reason: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable' }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  });
}

// "לא עכשיו" או סירוב נשמרים, כדי לא לבקש שוב בכל כניסה
const DISMISS_KEY = 'seavibes_location_dismissed';
export function isLocationDismissed(): boolean {
  try { return !!localStorage.getItem(DISMISS_KEY); } catch { return false; }
}
export function dismissLocation() {
  try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { /* אחסון לא זמין */ }
}
