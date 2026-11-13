// נקודת הכניסה של המסכים: מסך פתיחה למשתמש חדש, אחרת המסך הראשי.
// מתי נוגעים: כשמוסיפים מסך חדש ברמה העליונה.
import OnboardingFlow from './components/OnboardingFlow';
import HomeScreen from './screens/HomeScreen';
import { useSettings } from './lib/useSettings';

export default function App() {
  const settingsApi = useSettings();
  const { settings, completeOnboarding } = settingsApi;

  if (!settings.onboardingCompleted) {
    return (
      <OnboardingFlow onComplete={completeOnboarding} initialFavorites={settings.favorites} initialActivities={settings.favoriteActivities} />
    );
  }
  return <HomeScreen {...settingsApi} />;
}
