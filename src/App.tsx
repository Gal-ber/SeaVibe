/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// המסך הראשי של SeaVibes: מחבר בין ההעדפות, שער הנתונים ומנוע הציון.
// מתי נוגעים: כשמשנים את מבנה המסך הראשי.

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { BEACHES, ACTIVITIES } from './data/beaches';
import { ActivityId, Beach, UserSettings } from './types';
import { getRecommendation } from './engine/recommend';
import { useForecastData } from './lib/useForecastData';
import { buildBeachForecast } from './engine/forecastView';
import texts from '../config/texts/he.json';
import { getDistance, getBackgroundState } from './lib/utils';
import ActivitySelector from './components/ActivitySelector';
import BeachSearch from './components/BeachSearch';
import FavoriteBeachesStrip from './components/FavoriteBeachesStrip';
import CurrentBeachHero from './components/CurrentBeachHero';
import DynamicSeaBackground from './components/DynamicSeaBackground';
import OnboardingFlow from './components/OnboardingFlow';
import DetailedBeachView from './components/DetailedBeachView';
import LocationPermissionCard from './components/LocationPermissionCard';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('seavibes_settings');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed ? {
        ...parsed,
        favoriteActivities: parsed.favoriteActivities || (parsed.favoriteActivity ? [parsed.favoriteActivity] : [])
      } : { 
        onboardingCompleted: false, 
        favorites: [], 
        favoriteActivities: [],
        locationPermissionGranted: false 
      };
    } catch {
      return { onboardingCompleted: false, favorites: [], favoriteActivities: [], locationPermissionGranted: false };
    }
  });

  const [selectedActivity, setSelectedActivity] = useState<ActivityId>(settings.favoriteActivities?.[0] || 'beach');
  const [selectedBeachId, setSelectedBeachId] = useState<string | null>(settings.primaryFavorite || null);
  const [detailedBeachId, setDetailedBeachId] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => {
    return !localStorage.getItem('seavibes_location_dismissed');
  });

  const handleDismissLocation = () => {
    localStorage.setItem('seavibes_location_dismissed', 'true');
    setShowLocationPrompt(false);
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('seavibes_settings', JSON.stringify(settings));
  }, [settings]);

  // כל התחזיות מגיעות משער הנתונים. במצב mock אין שום פנייה לאינטרנט.
  // כל חוף מקבל סדרה שעתית אחת, והכרטיס מציג את השורה של השעה הנוכחית.
  const { status: dataStatus, result: forecastResult, reload: reloadData, now } = useForecastData();
  const beachesWithForecast: Beach[] = useMemo(() => BEACHES.map(b => ({
    ...b,
    forecast: buildBeachForecast(forecastResult.data?.series[b.id], forecastResult.mode, now),
  })), [forecastResult, now]);

  const handleOnboardingComplete = (data: { favorites: string[], favoriteActivities: ActivityId[], locationPermission: boolean }) => {
    setSettings({
      onboardingCompleted: true,
      favorites: data.favorites,
      primaryFavorite: data.favorites[0],
      favoriteActivities: data.favoriteActivities,
      locationPermissionGranted: data.locationPermission
    });
    if (data.favorites.length > 0) setSelectedBeachId(data.favorites[0]);
    if (data.favoriteActivities.length > 0) setSelectedActivity(data.favoriteActivities[0]);
  };

  const handleToggleFavorite = (beachId: string) => {
    setSettings(prev => {
      const isFav = prev.favorites.includes(beachId);
      const newFavs = isFav 
        ? prev.favorites.filter(id => id !== beachId) 
        : [...prev.favorites, beachId];
      return { ...prev, favorites: newFavs };
    });
  };

  const selectedBeach = useMemo(() => {
    const beach = beachesWithForecast.find(b => b.id === (selectedBeachId || settings.primaryFavorite));
    if (!beach) return null;
    return { ...beach, isFavorite: settings.favorites.includes(beach.id) };
  }, [selectedBeachId, settings.primaryFavorite, settings.favorites, beachesWithForecast]);

  const currentRecommendation = useMemo(() => {
    if (!selectedBeach) return null;
    return getRecommendation(selectedBeach.forecast, selectedActivity);
  }, [selectedBeach, selectedActivity]);

  const favoriteBeaches = useMemo(() => {
    return beachesWithForecast.filter(b => settings.favorites.includes(b.id));
  }, [settings.favorites, beachesWithForecast]);

  const detailedBeach = beachesWithForecast.find(b => b.id === detailedBeachId) || null;

  const bgState = useMemo(() => {
    return selectedBeach ? getBackgroundState(selectedBeach) : 'calm_sunny_day';
  }, [selectedBeach]);

  // Handle location-based default
  useEffect(() => {
    if (settings.locationPermissionGranted && !selectedBeachId) {
      // In a real app we'd get coords and find nearest. 
      // For mock, let's just pick one or stick to primary if exists.
      if (!settings.primaryFavorite) {
         setSelectedBeachId(BEACHES[0].id);
      }
    }
  }, [settings.locationPermissionGranted, selectedBeachId, settings.primaryFavorite]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  };

  if (!settings.onboardingCompleted) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete} 
        initialFavorites={settings.favorites}
        initialActivities={settings.favoriteActivities}
      />
    );
  }

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden" dir="rtl">
      <DynamicSeaBackground state={bgState} />

      <main className="max-w-md mx-auto px-6 pt-6 pb-20">
        {/* 1. SeaVibes Brand Header */}
        <header className="mb-6 py-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-sea-600 rounded-xl flex items-center justify-center shadow-lg shadow-sea-500/20">
              <LucideIcons.Waves className="text-white" size={18} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">SeaVibes</span>
            <span className="ms-auto text-[11px] font-bold text-slate-700 bg-sand-200 px-2 py-0.5 rounded-full">
              {forecastResult.mode === 'mock' && dataStatus !== 'unavailable' ? texts['dataBadge.mock'] : texts['dataBadge.unavailable']}
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">מה הווייב של הים היום?</p>
        </header>

        {/* 2. Search Bar */}
        <div className="mb-8">
          <BeachSearch 
            onSelect={setSelectedBeachId} 
            favorites={settings.favorites} 
            onToggleFavorite={handleToggleFavorite} 
            inputRef={searchInputRef}
          />
        </div>

        {/* 3. My Favorite Beaches Strip - Compact */}
        {favoriteBeaches.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">החופים שלי</h3>
            </div>
            <FavoriteBeachesStrip 
              favorites={favoriteBeaches} 
              selectedActivity={selectedActivity}
              currentBeachId={selectedBeachId || ''} 
              onSelect={setSelectedBeachId} 
            />
          </section>
        )}

        {/* 4. Main Recommendation Hero */}
        <AnimatePresence mode="wait">
          {selectedBeach && dataStatus !== 'ready' ? (
            <div key="data-status" className="py-16 text-center space-y-4" role="status">
              <p className="text-lg font-black text-slate-700">
                {dataStatus === 'loading' ? texts['data.loading'] : texts['data.error']}
              </p>
              {dataStatus === 'unavailable' && (
                <button onClick={reloadData} className="px-6 py-3 bg-sea-600 text-white rounded-2xl font-extrabold">
                  {texts['data.retry']}
                </button>
              )}
            </div>
          ) : selectedBeach ? (
            <div key={selectedBeach.id} className="mb-12">
              <CurrentBeachHero 
                beach={selectedBeach} 
                isMock={forecastResult.mode === 'mock'}
                recommendation={currentRecommendation}
                selectedActivity={selectedActivity}
                isFavorite={selectedBeach.isFavorite}
                onToggleFavorite={() => handleToggleFavorite(selectedBeach.id)}
                onShowDetails={() => setDetailedBeachId(selectedBeach.id)}
              />

              {/* 5. Activity Selector (Now below hero for better focus on recommendation) */}
              <section className="mt-4 mb-4">
                 <ActivitySelector 
                   selectedActivity={selectedActivity} 
                   onSelect={setSelectedActivity} 
                   onOpenPreferences={() => setSettings({ ...settings, onboardingCompleted: false })}
                 />
              </section>

              {/* Location Prompt - Non blocking */}
              {!settings.locationPermissionGranted && showLocationPrompt && (
                <div className="mb-8">
                  <LocationPermissionCard 
                    beachName={selectedBeach.name}
                    onEnable={() => {
                      setSettings({ ...settings, locationPermissionGranted: true });
                      setShowLocationPrompt(false);
                    }}
                    onDismiss={handleDismissLocation}
                  />
                </div>
              )}

              {/* Quick Link to Detailed View */}
              <div className="flex justify-center">
                 <button 
                   onClick={() => setDetailedBeachId(selectedBeach.id)}
                   className="flex items-center gap-2 px-8 py-5 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/50 text-slate-800 font-black hover:bg-white/60 transition-all shadow-sm"
                 >
                   <span>לנתונים המלאים ותחזית שעתית</span>
                   <LucideIcons.ChevronDown size={18} />
                 </button>
              </div>
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-20 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-slate-300 mx-auto border border-white/40">
                <LucideIcons.Search size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-800">איזה חוף בודקים היום?</h2>
                <p className="text-sm font-medium text-slate-400">חפש חוף או בחר מהמועדפים שלך</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Detailed View Overlay */}
      <AnimatePresence>
        {detailedBeach && (
          <DetailedBeachView 
            beach={detailedBeach}
            isMock={forecastResult.mode === 'mock'}
            recommendation={getRecommendation(detailedBeach.forecast, selectedActivity)}
            selectedActivity={selectedActivity}
            isFavorite={settings.favorites.includes(detailedBeach.id)}
            onToggleFavorite={() => handleToggleFavorite(detailedBeach.id)}
            onClose={() => setDetailedBeachId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

