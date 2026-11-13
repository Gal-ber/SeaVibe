/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Beach, ActivityId, BeachRecommendation } from '../types';
import { ACTIVITIES } from '../data/beaches';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

interface CurrentBeachHeroProps {
  beach: Beach;
  recommendation: BeachRecommendation;
  selectedActivity: ActivityId;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShowDetails: () => void;
}

export default function CurrentBeachHero({ beach, recommendation, selectedActivity, isFavorite, onToggleFavorite, onShowDetails }: CurrentBeachHeroProps) {
  const getStatusColor = (status: BeachRecommendation['status']) => {
    switch (status) {
      case 'excellent': return 'text-emerald-500';
      case 'good': return 'text-sea-500';
      case 'fair': return 'text-amber-500';
      case 'poor': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  const activityLabel = ACTIVITIES.find(a => a.id === selectedActivity)?.label || 'כללי';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-4 pb-8 text-right"
      dir="rtl"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{beach.city}</div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 leading-tight">{beach.name}</h1>
            <button 
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-full transition-all ${isFavorite ? 'text-rose-500 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
            >
              <LucideIcons.Heart size={28} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          {isFavorite && (
             <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-500 rounded-full border border-rose-100">
               <LucideIcons.Heart size={10} fill="currentColor" />
               <span className="text-[10px] font-black uppercase tracking-wider leading-none">נבחר כחוף מועדף</span>
             </div>
          )}
        </div>
        <button 
          onClick={onShowDetails}
          className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center text-slate-400 border border-white/50 shadow-sm hover:bg-white transition-colors"
        >
          <LucideIcons.Maximize2 size={20} />
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 border border-white/80 shadow-2xl shadow-slate-200/40">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex-1 order-2 md:order-1 text-center md:text-right">
             <div className="flex flex-col gap-1 mb-6">
               <h2 className="text-xl font-black text-slate-900">וייב {activityLabel}: {recommendation.score}/100</h2>
               <div className={`text-sm font-black uppercase tracking-widest ${getStatusColor(recommendation.status)}`}>
                 {recommendation.status === 'excellent' ? 'מצוין' : 
                  recommendation.status === 'good' ? 'טוב' : 
                  recommendation.status === 'fair' ? 'בינוני' : 'חלש'}
               </div>
             </div>
             
             <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3">
               {recommendation.headline}
             </h3>
             <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
               {recommendation.shortExplanation}
             </p>
             
             <div className="inline-flex items-center gap-3 bg-amber-50 rounded-2xl px-5 py-3 border border-amber-100">
               <LucideIcons.Clock className="text-amber-500" size={18} />
               <div className="text-right">
                 <div className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest leading-none mb-1">הזמן המומלץ היום</div>
                 <div className="text-sm font-black text-amber-700 leading-none">
                   {recommendation.bestTimeWindow} · הכי רגוע
                 </div>
               </div>
             </div>
          </div>

          <div className="relative order-1 md:order-2">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100/50"
              />
              <motion.circle
                initial={{ strokeDashoffset: 377 }}
                animate={{ strokeDashoffset: 377 - (377 * recommendation.score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={377}
                className={`transition-all duration-300 ${getStatusColor(recommendation.status)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900">{recommendation.score}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SCORE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-10">
           <HeroStat icon="Thermometer" label="אוויר" value={`${beach.forecast.temperature}°`} />
           <HeroStat icon="Droplets" label="מים" value={`${beach.forecast.waterTemp}°`} />
           <HeroStat icon="Waves" label="גלים" value={`${beach.forecast.waveHeight}m`} />
           <HeroStat icon="Wind" label="רוח" value={`${beach.forecast.windSpeed}`} unit="km/h" />
        </div>
      </div>
    </motion.div>
  );
}

function HeroStat({ icon, label, value, unit }: { icon: string, label: string, value: string, unit?: string }) {
  const Icon = (LucideIcons as any)[icon];
  return (
    <div className="bg-white/40 p-4 rounded-3xl text-center border border-white flex flex-col items-center">
      <div className="text-sea-500 mb-2">
        <Icon size={18} />
      </div>
      <div className="text-sm font-black text-slate-800">{value}</div>
      <div className="text-[9px] font-black text-slate-400 uppercase truncate mt-0.5 tracking-tight">
        {label} {unit && <span className="opacity-50 lowercase">{unit}</span>}
      </div>
    </div>
  );
}
