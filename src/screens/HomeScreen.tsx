// המסך הראשי: כותרת, חיפוש, חופים מועדפים, כרטיס הציון, בחירת פעילות ומסך הפירוט.
// כל התחזיות מגיעות משער הנתונים. במצב mock אין שום פנייה לאינטרנט.
// בטלפון: עמודה אחת. במחשב (lg): שתי עמודות, כרטיס הציון והטבלה השעתית זה לצד זה.
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
import { useMediaQuery } from '../lib/useMediaQuery';
import { useLocationBeach } from '../lib/useLocationBeach';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { timeAgo } from '../lib/timeAgo';
import ActivitySelector from '../components/ActivitySelector';
import BeachSearch from '../components/BeachSearch';
import FavoriteBeachesStrip from '../components/FavoriteBeachesStrip';
import CurrentBeachHero from '../components/CurrentBeachHero';
import DynamicSeaBackground from '../components/DynamicSeaBackground';
import DetailedBeachView from '../components/DetailedBeachView';
import LocationPermissionCard from '../components/LocationPermissionCard';
import LanguageToggle from '../components/LanguageToggle';
import HourlySection from '../components/HourlySection';

export default function HomeScreen({ settings, toggleFavorite, setPrimary, reopenPreferences, setLocationGranted }: ReturnType<typeof useSettings>) {
  const { t, lang } = useI18n();
  const [activity, setActivity] = useState<ActivityId>(settings.favoriteActivities[0] || 'beach');
  const [selectedBeachId, setSelectedBeachId] = useState<string | null>(settings.primaryFavorite || null);
  const [detailId, setDetailId] = useState<string | null>(null);
  // FR-3: חוף קרוב (אם יש מיקום), אחרת המועדף הראשי, אחרת מסך בחירה
  const location = useLocationBeach(settings.locationPermissionGranted, setLocationGranted, setSelectedBeachId);

  const { status, result, reload, now } = useForecastData();
  const isWide = useMediaQuery('(min-width: 1024px)');
  const isMock = result.mode === 'mock';
  const beaches: Beach[] = useMemo(
    () => BEACHES.map((b) => ({ ...b, forecast: buildBeachForecast(result.data?.series[b.id], result.mode, now) })),
    [result, now],
  );
  const selectedBeach = beaches.find((b) => b.id === (selectedBeachId || settings.primaryFavorite)) || null;
  const detailBeach = beaches.find((b) => b.id === detailId) || null;
  const favoriteBeaches = beaches.filter((b) => settings.favorites.includes(b.id));
  const recommendation = selectedBeach ? getRecommendation(selectedBeach.forecast, activity, lang) : null;


  return (
    <div className="safe-area min-h-screen font-sans relative overflow-x-hidden">
      <DynamicSeaBackground state={selectedBeach ? getBackgroundState(selectedBeach) : 'calm_sunny_day'} />

      <main className="max-w-md md:max-w-2xl lg:max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">
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
          {result.cachedAt && (
            <p data-testid="offline-banner" role="status" className="mt-3 text-sm font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2">
              {t('offline.banner', { ago: timeAgo(result.cachedAt, now, lang) })}
            </p>
          )}
          {location.nearestId && (
            <p data-testid="nearest-beach" className="mt-3 text-sm font-bold text-slate-800">
              {t('location.nearest', { beach: beachName(BEACHES.find((b) => b.id === location.nearestId)!, lang) })}
            </p>
          )}
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-10 lg:items-start">
        <div>
        <div className="mb-8">
          <BeachSearch
            onSelect={setSelectedBeachId}
            favorites={settings.favorites}
            onToggleFavorite={toggleFavorite}
            onSelectActivity={setActivity}
            rankBeaches={(a) =>
              beaches
                .map((b) => ({ beach: b, score: getRecommendation(b.forecast, a, lang)?.score ?? null }))
                .sort((x, y) => (y.score ?? -1) - (x.score ?? -1))
            }
          />
        </div>

        {favoriteBeaches.length > 0 && (
          <section className="mb-10">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 px-1">{t('app.myBeaches')}</h3>
            <FavoriteBeachesStrip favorites={favoriteBeaches} selectedActivity={activity} currentBeachId={selectedBeach?.id || ''} onSelect={setSelectedBeachId} />
          </section>
        )}

        {selectedBeach && status === 'loading' ? (
          <LoadingSkeleton label={t('data.loading')} />
        ) : selectedBeach && status === 'unavailable' ? (
          <div className="py-16 text-center space-y-4" role="alert">
            <p className="text-lg font-black text-slate-800">{t('data.error')}</p>
            <button onClick={reload} className="min-h-11 px-6 py-3 bg-sea-700 text-white rounded-2xl font-extrabold">{t('data.retry')}</button>
          </div>
        ) : selectedBeach ? (
          <div key={selectedBeach.id} className="mb-12">
            <CurrentBeachHero
              beach={selectedBeach}
              isMock={isMock}
              recommendation={recommendation}
              selectedActivity={activity}
              isFavorite={settings.favorites.includes(selectedBeach.id)}
              isPrimary={settings.primaryFavorite === selectedBeach.id}
              onToggleFavorite={() => toggleFavorite(selectedBeach.id)}
              onMakePrimary={() => setPrimary(selectedBeach.id)}
              onShowDetails={() => setDetailId(selectedBeach.id)}
            />
            <section className="mt-4 mb-4">
              <ActivitySelector selectedActivity={activity} onSelect={setActivity} onOpenPreferences={reopenPreferences} />
            </section>
            {!settings.locationPermissionGranted && !location.dismissed && (
              <div className="mb-8">
                <LocationPermissionCard beachName={beachName(selectedBeach, lang)} state={location.state} onEnable={location.request} onDismiss={location.dismiss} />
              </div>
            )}
            <div className="flex justify-center">
              <button onClick={() => setDetailId(selectedBeach.id)} className="min-h-11 flex items-center gap-2 px-8 py-5 bg-white/90 backdrop-blur-md rounded-[2rem] border border-white/50 text-slate-800 font-black hover:bg-white/80 transition-all shadow-sm">
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
        </div>

        {/* עמודה שנייה, רק במחשב: הטבלה השעתית של אותו חוף ואותה פעילות */}
        {selectedBeach && status === 'ready' && isWide && (
          <aside data-testid="desktop-hourly" className="lg:sticky lg:top-6">
            <HourlySection beach={selectedBeach} activity={activity} />
          </aside>
        )}
        </div>
      </main>

      <AnimatePresence>
        {detailBeach && (
          <DetailedBeachView
            beach={detailBeach}
            isMock={isMock}
            generatedAt={result.data?.generatedAt ?? null}
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
