/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Beach } from '../types';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

interface FavoriteBeachesStripProps {
  favorites: Beach[];
  currentBeachId: string;
  onSelect: (beachId: string) => void;
}

export default function FavoriteBeachesStrip({ favorites, currentBeachId, onSelect }: FavoriteBeachesStripProps) {
  if (favorites.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-1 py-2 scroll-smooth" dir="rtl">
      {favorites.map(beach => {
        const isActive = currentBeachId === beach.id;
        // Mock vibe score based on existing forecast data for variation
        const vibeScore = Math.floor((beach.forecast.waveHeight / 2) * 50) + 30; // Dummy logic
        const clampedScore = Math.min(Math.max(vibeScore, 45), 98);

        return (
          <button
            key={beach.id}
            onClick={() => onSelect(beach.id)}
            className={`flex-shrink-0 w-36 p-5 rounded-[2rem] border-2 transition-all text-right relative ${
              isActive
                ? 'bg-sea-600 border-sea-600 shadow-xl shadow-sea-500/30 text-white'
                : 'bg-white/60 backdrop-blur-md border-white/50 text-slate-800 hover:bg-white/80'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isActive ? 'text-sea-200' : 'text-slate-400'}`}>
                  {beach.city}
                </div>
                <div className="text-sm font-black truncate">{beach.name}</div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className={`text-xl font-black leading-none ${isActive ? 'text-white' : 'text-sea-600'}`}>
                    {clampedScore}
                  </span>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-sea-100/70' : 'text-slate-400'}`}>
                    וייב
                  </span>
                </div>
                
                <div className={`flex flex-col items-end gap-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                  <div className="flex items-center gap-1">
                    <LucideIcons.Waves size={10} />
                    <span className="text-[10px] font-bold">{beach.forecast.waveHeight}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LucideIcons.Umbrella size={10} />
                    <span className="text-[10px] font-bold">{beach.forecast.temperature}°</span>
                  </div>
                </div>
              </div>
            </div>
            {isActive && (
              <motion.div 
                layoutId="active-bg"
                className="absolute inset-0 bg-sea-600 rounded-[2rem] -z-10" 
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
