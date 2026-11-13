/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Beach, ActivityId, BeachRecommendation, SelectedParameter, FieldReport } from '../types';
import * as LucideIcons from 'lucide-react';
import WindSummary from './WindSummary';
import ParameterCard from './ParameterCard';
import HourlyForecastTable from './HourlyForecastTable';
import HourlyInsight from './HourlyInsight';
import { generateHourlyInsight } from '../lib/hourlyInsight';
import FieldReportSummaryView from './FieldReportSummary';
import FieldReportActions from './FieldReportActions';
import { getRecentFieldReports, summarizeFieldReports } from '../lib/fieldReports';
import { MOCK_FIELD_REPORTS } from '../data/mockFieldReports';
import { ACTIVITIES } from '../data/beaches';
import DynamicSeaBackground from './DynamicSeaBackground';
import { getBackgroundState } from '../lib/utils';

interface DetailedBeachViewProps {
  beach: Beach;
  recommendation: BeachRecommendation;
  selectedActivity: ActivityId;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export default function DetailedBeachView({ beach, recommendation, selectedActivity, isFavorite, onToggleFavorite, onClose }: DetailedBeachViewProps) {
  const [selectedParam, setSelectedParam] = useState<SelectedParameter>('waveHeight');
  const [localReports, setLocalReports] = useState<FieldReport[]>(MOCK_FIELD_REPORTS);

  const parameterOptions: { id: SelectedParameter; label: string; icon: string; value: string }[] = [
    { id: 'waveHeight', label: 'גובה גלים', icon: 'Waves', value: `${beach.forecast.waveHeight} מ׳` },
    { id: 'wind', label: 'רוח', icon: 'Wind', value: `${beach.forecast.windSpeed} km/h` },
    { id: 'airTemperature', label: 'טמפ׳ אוויר', icon: 'Thermometer', value: `${beach.forecast.temperature}°` },
    { id: 'waterTemperature', label: 'טמפ׳ מים', icon: 'Droplets', value: `${beach.forecast.waterTemp}°` },
  ];

  const hourlyInsight = generateHourlyInsight(
    selectedParam,
    beach.forecast.hourlyForecast || [],
    selectedActivity
  );

  const activityLabel = ACTIVITIES.find(a => a.id === selectedActivity)?.label || '';

  const reportSummary = useMemo(() => {
    const recent = getRecentFieldReports(localReports, beach.id, selectedActivity);
    return summarizeFieldReports(recent, activityLabel);
  }, [localReports, beach.id, selectedActivity, activityLabel]);

  const handleSubmitReport = (isAccurate: boolean, reason?: string) => {
    const newReport: FieldReport = {
      id: Math.random().toString(36).substr(2, 9),
      beachId: beach.id,
      activity: selectedActivity,
      isAccurate,
      reason,
      createdAt: new Date().toISOString(),
    };
    setLocalReports(prev => [newReport, ...prev]);
  };

  const backgroundState = getBackgroundState(beach);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto pb-20"
      dir="rtl"
    >
      <div className="fixed inset-0 -z-10 h-1/2">
        <DynamicSeaBackground state={backgroundState} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-[1.25rem] bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-400 border border-white/50 shadow-sm hover:bg-white transition-colors"
        >
          <LucideIcons.ChevronRight size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-black text-white/80 uppercase tracking-widest drop-shadow-sm mb-0.5">SeaVibes Detailed</div>
          <h2 className="text-xl font-black text-slate-900 drop-shadow-sm">{beach.name}</h2>
        </div>

        <button 
          onClick={onToggleFavorite}
          className={`w-12 h-12 rounded-[1.25rem] bg-white/80 backdrop-blur-md flex items-center justify-center transition-all border border-white/50 shadow-sm ${isFavorite ? 'text-rose-500' : 'text-slate-200 hover:text-slate-300'}`}
        >
          <LucideIcons.Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-12 mt-4 relative z-10">
        {/* Main Recommendation Summary */}
        <section className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 border border-white shadow-2xl shadow-slate-200/50">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-current-color/20 ${getStatusBg(recommendation.status)}`}>
                {recommendation.score}
              </div>
            </div>
            <div className="flex-1">
               <h3 className="font-black text-2xl text-slate-900 mb-1 leading-tight">{recommendation.headline}</h3>
               <div className="flex items-center gap-2 text-slate-400">
                 <LucideIcons.Clock size={14} className="text-amber-500" />
                 <span className="text-sm font-black">{recommendation.bestTimeWindow} · <span className="text-sea-500">הכי רגוע היום</span></span>
               </div>
            </div>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed text-lg italic pr-4 border-r-2 border-slate-100">
            "{recommendation.shortExplanation}"
          </p>
        </section>

        {/* Community Field Reports Section */}
        <section className="space-y-6">
          <SectionHeader icon="Users" title="מה אומרים מהחוף?" subtitle="דיווחים מהשטח" />
          <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white shadow-xl shadow-slate-200/30">
            <FieldReportSummaryView summary={reportSummary} />
            <div className="mt-8 pt-8 border-t border-slate-50">
              <FieldReportActions 
                activityLabel={activityLabel} 
                onSubmit={handleSubmitReport} 
              />
            </div>
          </div>
        </section>

        {/* Dynamic Hourly Forecast Table */}
        <section className="space-y-6">
          <SectionHeader icon="BarChart3" title="ניתוח שעתית אינטראקטיבי" subtitle="בחרו נתון להשוואה" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {parameterOptions.map((opt) => (
              <ParameterCard
                key={opt.id}
                id={opt.id}
                label={opt.label}
                icon={opt.icon}
                value={opt.value}
                isSelected={selectedParam === opt.id}
                onClick={setSelectedParam}
              />
            ))}
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-xl shadow-slate-200/40">
            <HourlyInsight insight={hourlyInsight} />
            <div className="mt-6">
              <HourlyForecastTable 
                data={beach.forecast.hourlyForecast || []} 
                selectedParameter={selectedParam} 
              />
            </div>
          </div>
        </section>

        {/* Wind Summary Section */}
        <section className="space-y-6">
          <SectionHeader icon="Wind" title="ניצול הרוח ומשטר הרוחות" subtitle="ניתוח מקצועי" />
          <WindSummary beach={beach} selectedActivity={selectedActivity} />
        </section>

        {/* Why this recommendation section */}
        <section className="space-y-6">
          <SectionHeader icon="Info" title="למה קיבלתי את ההמלצה הזו?" subtitle="אלגוריתם הציון" />
          
          <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 border border-white shadow-xl shadow-slate-200/40 space-y-10">
            <div className="flex flex-col md:flex-row gap-8">
              {recommendation.positiveFactors.length > 0 && (
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LucideIcons.CheckCircle2 size={16} />
                    מה עובד לטובתך?
                  </h4>
                  <ul className="space-y-3">
                    {recommendation.positiveFactors.map((factor, i) => (
                      <li key={i} className="text-sm font-bold text-slate-700 flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.negativeFactors.length > 0 && (
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LucideIcons.AlertCircle size={16} />
                    מה פחות אידיאלי?
                  </h4>
                  <ul className="space-y-3">
                    {recommendation.negativeFactors.map((factor, i) => (
                      <li key={i} className="text-sm font-bold text-slate-700 flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-300 mt-1.5 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-slate-50 text-center">
              <p className="text-slate-400 text-sm font-black italic max-w-sm mx-auto leading-relaxed">
                "{recommendation.explanationSummary}"
              </p>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="bg-white/60 backdrop-blur-lg rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 group">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
             <LucideIcons.MapPin className="text-slate-300" size={32} />
           </div>
           <h3 className="font-black text-xl text-slate-700 mb-2">מפת החוף והסביבה</h3>
           <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
             בשלב הבא נציג כאן מפה חיה, תחנות מדידה, מרינות ונקודות עניין.
           </p>
        </section>

        {/* Raw Data Table - Secondary */}
        <div className="text-center pt-8">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">SeaVibes Engine v1.2</p>
          <div className="text-slate-200 text-xs">כל הנתונים מבוססים על תחזית ודיווחים מהשטח</div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  const Icon = (LucideIcons as any)[icon];
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-sea-500 shadow-sm">
          <Icon size={20} />
        </div>
        <h3 className="font-black text-lg text-slate-900 tracking-tight">{title}</h3>
      </div>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{subtitle}</span>
    </div>
  );
}

function getStatusBg(status: BeachRecommendation['status']) {
  switch (status) {
    case 'excellent': return 'bg-emerald-500 shadow-emerald-500/30';
    case 'good': return 'bg-sea-500 shadow-sea-500/30';
    case 'fair': return 'bg-amber-500 shadow-amber-500/30';
    case 'poor': return 'bg-rose-500 shadow-rose-500/30';
  }
}
