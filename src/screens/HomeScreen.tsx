// המסך הראשי: כותרת, חיפוש, חופים מועדפים, כרטיס הציון, בחירת פעילות ומסך הפירוט.
// כל התחזיות מגיעות משער הנתונים. במצב mock אין שום פנייה לאינטרנט.
// מתי נוגעים: כשמשנים את סדר החלקים במסך הראשי.
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { BEACHES, beachName } from '../data/beaches';
import { ActivityId, Beach } from '../types';
import { getRecommendation } from '../engine/recommend';
import { buildBeachForecast } from '../engine/forecastView';
import { useForecastData } from '../lib/useForecastData';
import { useSettings } from '../lib/useSettings';
import { getBackgroundState } from '../lib/utils';
import { useI18n } from '../i18n/I18nProvider';
import ActivitySelector from '../components/ActivitySelector';
import BeachSearch from '../components/BeachSearch';
import FavoriteBeachesStrip from '../components/FavoriteBeachesStrip';
import CurrentBeachHero from '../components/CurrentBeachHero';
import DynamicSeaBackground from '../components/DynamicSeaBackground';
import DetailedBeachView from '../components/DetailedBeachView';
import LocationPermissionCard from '../components/LocationPermissionCard';
import LanguageToggle from '../components/LanguageToggle';

const DISMISS_KEY = 'seavibes_location_dismissed';
const readDismissed = () => { try { return !!localStorage.getItem(DISMISS_KEY); } catch { return false; } };

export default function HomeScreen({ settings, toggleFavorite, reopenPreferences, setLocationGranted }: ReturnType<typeof useSettings>) {
  const { t, lang } = useI18n();
  const [activity, setActivity] = useState<ActivityId>(settings.favoriteActivities[0] || 'beach');
  const [selectedBeachId, setSelectedBeachId] = useState<string | null>(settings.primaryFavorite || null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [locationDismissed, setLocationDismissed] = useState(readDismissed);

  const { status, result, reload, now } = useForecastData();
  const isMock = result.mode === 'mock';
  const beaches: Beach[] = useMemo(
    () => BEACHES.map((b) => ({ ...b, forecast: buildBeachForecast(result.data?.series[b.id], result.mode, now) })),
    [result, now],
  );
  const selectedBeach = beaches.find((b) => b.id === (selectedBeachId || settings.primaryFavorite)) || null;
  const detailBeach = beaches.find((b) => b.id === detailId) || null;
  const favoriteBeaches = beaches.filter((b) => settings.favorites.includes(b.id));
  const recommendation = selectedBeach ? getRecommendation(selectedBeach.forecast, activity, lang) : null;

  const dismissLocation = () => {
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { /* אחסון לא זמין */ }
    setLocationDismissed(true);
  };

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden">
      <DynamicSeaBackground state={selectedBeach ? getBackgroundState(selectedBeach) : 'calm_sunny_day'} />

      <main className="max-w-md mx-auto px-4 sm:px-6 pt-6 pb-20">
        <header className="mb-6 py-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-sea-600 rounded-xl flex items-center justify-center shadow-lg shadow-sea-500/20">
              <LucideIcons.Waves className="text-white" size={18} aria-hidden="true" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">SeaVibes</span>
            <span className="ms-auto text-[11px] font-bold text-slate-800 bg-sand-200 px-2 py-0.5 rounded-full">
              {isMock && status !== 'unavailable' ? t('dataBadge.mock') : t('dataBadge.unavailable')}
            </span>
            <LanguageToggle />
          </div>
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest leading-none">{t('app.tagline')}</p>
        </header>

        <div className="mb-8">
          <BeachSearch onSelect={setSelectedBeachId} favorites={settings.favorites} onToggleFavorite={toggleFavorite} />
        </div>

        {favoriteBeaches.length > 0 && (
          <section className="mb-10">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 px-1">{t('app.myBeaches')}</h3>
            <FavoriteBeachesStrip favorites={favoriteBeaches} selectedActivity={activity} currentBeachId={selectedBeach?.id || ''} onSelect={setSelectedBeachId} />
          </section>
        )}

        {selectedBeach && status !== 'ready' ? (
          <div className="py-16 text-center space-y-4" role="status">
            <p className="text-lg font-black text-slate-800">{t(status === 'loading' ? 'data.loading' : 'data.error')}</p>
            {status === 'unavailable' && (
              <button onClick={reload} className="min-h-11 px-6 py-3 bg-sea-600 text-white rounded-2xl font-extrabold">{t('data.retry')}</button>
            )}
          </div>
        ) : selectedBeach ? (
          <div key={selectedBeach.id} className="mb-12">
            <CurrentBeachHero
              beach={selectedBeach}
              isMock={isMock}
              recommendation={recommendation}
              selectedActivity={activity}
              isFavorite={settings.favorites.includes(selectedBeach.id)}
              onToggleFavorite={() => toggleFavorite(selectedBeach.id)}
              onShowDetails={() => setDetailId(selectedBeach.id)}
            />
            <section className="mt-4 mb-4">
              <ActivitySelector selectedActivity={activity} onSelect={setActivity} onOpenPreferences={reopenPreferences} />
            </section>
            {!settings.locationPermissionGranted && !locationDismissed && (
              <div className="mb-8">
                <LocationPermissionCard beachName={beachName(selectedBeach, lang)} onEnable={() => setLocationGranted(true)} onDismiss={dismissLocation} />
              </div>
            )}
            <div className="flex justify-center">
              <button onClick={() => setDetailId(selectedBeach.id)} className="min-h-11 flex items-center gap-2 px-8 py-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 text-slate-800 font-black hover:bg-white/80 transition-all shadow-sm">
                <span>{t('app.openDetails')}</span>
                <LucideIcons.ChevronDown size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <LucideIcons.Search size={32} className="mx-auto text-slate-500" aria-hidden="true" />
            <h2 className="text-xl font-black text-slate-800">{t('app.emptyTitle')}</h2>
            <p className="text-sm font-medium text-slate-700">{t('app.emptyHint')}</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {detailBeach && (
          <DetailedBeachView
            beach={detailBeach}
            isMock={isMock}
            recommendation={getRecommendation(detailBeach.forecast, activity, lang)}
            selectedActivity={activity}
            isFavorite={settings.favorites.includes(detailBeach.id)}
            onToggleFavorite={() => toggleFavorite(detailBeach.id)}
            onClose={() => setDetailId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
