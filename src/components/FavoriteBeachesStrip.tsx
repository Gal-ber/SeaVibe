/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// רצועת החופים המועדפים: לכל חוף ציון אמיתי מהמנוע לפעילות שנבחרה, וגלים וטמפ׳ של השעה הנוכחית.
import { ActivityId, Beach } from '../types';
import { getRecommendation } from '../engine/recommend';
import { formatValue, unavailable } from '../lib/formatValue';
import { beachCity, beachName } from '../data/beaches';
import { useI18n } from '../i18n/I18nProvider';
import { motion } from 'motion/react';
import { Icons as LucideIcons } from './icons';

interface FavoriteBeachesStripProps {
  favorites: Beach[];
  selectedActivity: ActivityId;
  currentBeachId: string;
  onSelect: (beachId: string) => void;
}

export default function FavoriteBeachesStrip({ favorites, selectedActivity, currentBeachId, onSelect }: FavoriteBeachesStripProps) {
  const { t, lang } = useI18n();
  if (favorites.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-1 py-2 scroll-smooth">
      {favorites.map(beach => {
        const isActive = currentBeachId === beach.id;
        const recommendation = getRecommendation(beach.forecast, selectedActivity, lang);

        return (
          <button
            key={beach.id}
            data-testid={`favorite-${beach.id}`}
            onClick={() => onSelect(beach.id)}
            className={`flex-shrink-0 w-36 p-5 rounded-[2rem] border-2 transition-all text-start relative ${
              isActive
                ? 'bg-sea-700 border-sea-700 shadow-xl shadow-sea-500/30 text-white'
                : 'bg-white/90 backdrop-blur-md border-white/50 text-slate-800 hover:bg-white'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className={`text-[11px] font-black uppercase tracking-widest mb-0.5 ${isActive ? 'text-white' : 'text-slate-700'}`}>
                  {beachCity(beach, lang)}
                </div>
                <div className="text-sm font-black truncate">{beachName(beach, lang)}</div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className={`text-xl font-black leading-none ${isActive ? 'text-white' : 'text-sea-600'}`}>
                    {recommendation ? recommendation.score : unavailable(lang)}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {t('strip.vibe')}
                  </span>
                </div>
                
                <div className={`flex flex-col items-end gap-0.5 ${isActive ? 'text-white' : 'text-slate-700'}`}>
                  <div className="flex items-center gap-1">
                    <LucideIcons.Waves size={10} />
                    <span className="text-[10px] font-bold">{formatValue('waveHeight', beach.forecast.waveHeight, lang)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LucideIcons.Umbrella size={10} />
                    <span className="text-[10px] font-bold">{formatValue('temperature', beach.forecast.temperature, lang)}</span>
                  </div>
                </div>
              </div>
            </div>
            {isActive && (
              <motion.div 
                layoutId="active-bg"
                className="absolute inset-0 bg-sea-700 rounded-[2rem] -z-10" 
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
