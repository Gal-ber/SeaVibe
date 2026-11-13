/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Beach, ActivityId, BeachRecommendation } from '../types';
import { ACTIVITIES } from '../data/beaches';
import { MOCK_FIELD_REPORTS } from '../data/mockFieldReports';
import { getRecentFieldReports, summarizeFieldReports } from '../lib/fieldReports';
import * as LucideIcons from 'lucide-react';
import React, { useState, useMemo } from 'react';

interface BeachCardProps {
  beach: Beach;
  recommendation: BeachRecommendation;
  selectedActivity: ActivityId;
  index: number;
  onShowDetails?: () => void;
  key?: React.Key;
}

export default function BeachCard({ beach, recommendation, selectedActivity, index, onShowDetails }: BeachCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const reportSummary = useMemo(() => {
    const activityLabel = ACTIVITIES.find(a => a.id === selectedActivity)?.label || '';
    const recent = getRecentFieldReports(MOCK_FIELD_REPORTS, beach.id, selectedActivity);
    return summarizeFieldReports(recent, activityLabel);
  }, [beach.id, selectedActivity]);

  const getStatusColor = (status: BeachRecommendation['status']) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-sea-500';
      case 'fair': return 'bg-amber-500';
      case 'poor': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: BeachRecommendation['status']) => {
    switch (status) {
      case 'excellent': return 'מעולה';
      case 'good': return 'טוב מאוד';
      case 'fair': return 'בינוני';
      case 'poor': return 'פחות מומלץ';
      default: return '';
    }
  };

  return (
    <motion.div
      id={`beach-card-${beach.id}`}
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-[2.5rem] overflow-hidden mb-6 flex flex-col group active:scale-[0.98] transition-transform cursor-pointer"
      dir="rtl"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header Info */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{beach.name}</h3>
            <p className="text-slate-500 font-medium text-sm">{beach.city}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${getStatusColor(recommendation.status)}`}>
              {recommendation.score}
            </div>
            <span className="text-[10px] font-bold mt-1 text-slate-400 uppercase tracking-wider">{getStatusLabel(recommendation.status)}</span>
          </div>
        </div>

        <div className="bg-sea-50/80 rounded-2xl p-4 border border-sea-100/50">
          <h4 className="text-sea-800 font-bold text-lg mb-1">{recommendation.headline}</h4>
          <p className="text-slate-600 text-sm leading-relaxed">{recommendation.shortExplanation}</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="px-6 pb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 bg-white/50 px-3 py-1.5 rounded-full border border-slate-100">
          <LucideIcons.Clock size={16} className="text-sea-500" />
          <span className="text-xs font-bold">{recommendation.bestTimeWindow}</span>
        </div>
        
        <div className="flex -space-x-1 space-x-reverse">
           {recommendation.suitableFor.slice(0, 3).map((actId) => {
             const activity = ACTIVITIES.find(a => a.id === actId);
             const Icon = (LucideIcons as any)[activity?.icon || 'HelpCircle'];
             return (
               <div key={actId} className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-sea-600" title={activity?.label}>
                 <Icon size={14} />
               </div>
             );
           })}
           {recommendation.suitableFor.length > 3 && (
             <div className="w-8 h-8 rounded-full bg-sea-100 border-2 border-white shadow-sm flex items-center justify-center text-sea-700 text-[10px] font-bold">
               +{recommendation.suitableFor.length - 3}
             </div>
           )}
        </div>

        {recommendation.riskFlags.map(flag => (
          <div key={flag} className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">
            <LucideIcons.AlertTriangle size={10} />
            {flag}
          </div>
        ))}

        {reportSummary.totalReports > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-sea-600 bg-sea-50 px-2 py-1 rounded-md">
            <LucideIcons.Users size={10} />
            {reportSummary.totalReports > 3 ? `${reportSummary.positivePercentage}% אישרו שמתאים` : 'דיווחים מהשטח זמינים'}
          </div>
        )}
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
          >
            <div className="p-6 flex flex-col gap-6">
              {/* Explanation Summary */}
              <div className="bg-sea-50/50 p-4 rounded-2xl border border-sea-100 flex gap-3">
                <LucideIcons.Info className="text-sea-500 shrink-0" size={18} />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-sea-600 uppercase tracking-widest block">למה קיבלתי את ההמלצה הזו?</span>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed italic line-clamp-2">
                    {recommendation.explanationSummary}
                  </p>
                </div>
              </div>

              {/* Highlights List */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                <ParameterItem icon="Waves" label="גלי ים" value={`${beach.forecast.waveHeight} מ׳`} />
                <ParameterItem icon="Wind" label="רוח" value={`${beach.forecast.windSpeed} קמ״ש`} />
                <ParameterItem icon="Thermometer" label="טמפ׳ אוויר" value={`${beach.forecast.temperature}°C`} />
                <ParameterItem icon="Droplets" label="טמפ׳ מים" value={`${beach.forecast.waterTemp}°C`} />
              </div>

              {/* Activity Lists */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">מומלץ במיוחד</span>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.suitableFor.map(id => (
                      <span key={id} className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg">
                        {ACTIVITIES.find(a => a.id === id)?.label}
                      </span>
                    ))}
                  </div>
                </div>
                {recommendation.notIdealFor.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">פחות מתאים ל-</span>
                    <div className="flex flex-wrap gap-2">
                       {recommendation.notIdealFor.map(id => (
                        <span key={id} className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-lg line-through">
                          {ACTIVITIES.find(a => a.id === id)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); onShowDetails?.(); }}
                className="w-full bg-sea-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-sea-100 hover:bg-sea-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>לעוד פרטים ותחזית שעתית</span>
                <LucideIcons.ArrowLeft size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ParameterItem({ icon, label, value }: { icon: string, label: string, value: string }) {
  const Icon = (LucideIcons as any)[icon];
  return (
    <div className="flex-shrink-0 w-24 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-right">
      <div className="w-7 h-7 bg-sea-50 rounded-lg flex items-center justify-center text-sea-500 mb-2">
        <Icon size={14} />
      </div>
      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">{label}</div>
      <div className="text-xs font-extrabold text-slate-800">{value}</div>
    </div>
  );
}
