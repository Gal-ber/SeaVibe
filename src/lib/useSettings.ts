// ההעדפות של המשתמש: חופים מועדפים, מועדף ראשי, פעילויות, והאם סיים את מסך הפתיחה.
// נשמרות במכשיר בלבד (localStorage). מיקום לא נשמר כאן לעולם.
// מתי נוגעים: כשמוסיפים העדפה חדשה.
import { useEffect, useState } from 'react';
import { ActivityId, UserSettings } from '../types';

const KEY = 'seavibes_settings';
const EMPTY: UserSettings = { onboardingCompleted: false, favorites: [], favoriteActivities: [], locationPermissionGranted: false };

function load(): UserSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
    return parsed ? { ...EMPTY, ...parsed } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      // אחסון לא זמין: ההעדפות יחזיקו עד סגירת הדף
    }
  }, [settings]);

  const completeOnboarding = (data: { favorites: string[]; favoriteActivities: ActivityId[]; locationPermission: boolean }) =>
    setSettings({
      onboardingCompleted: true,
      favorites: data.favorites,
      primaryFavorite: data.favorites[0],
      favoriteActivities: data.favoriteActivities,
      locationPermissionGranted: data.locationPermission,
    });

  const toggleFavorite = (beachId: string) =>
    setSettings((prev) => {
      const favorites = prev.favorites.includes(beachId) ? prev.favorites.filter((id) => id !== beachId) : [...prev.favorites, beachId];
      // הסרת המועדף הראשי מעבירה את העדיפות לבא בתור
      const primaryFavorite = favorites.includes(prev.primaryFavorite ?? '') ? prev.primaryFavorite : favorites[0];
      return { ...prev, favorites, primaryFavorite };
    });

  const setPrimary = (beachId: string) => setSettings((prev) => ({ ...prev, primaryFavorite: beachId }));
  const reopenPreferences = () => setSettings((prev) => ({ ...prev, onboardingCompleted: false }));
  const setLocationGranted = (granted: boolean) => setSettings((prev) => ({ ...prev, locationPermissionGranted: granted }));

  return { settings, completeOnboarding, toggleFavorite, setPrimary, reopenPreferences, setLocationGranted };
}
