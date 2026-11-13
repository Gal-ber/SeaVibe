/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Beach, ActivityId } from '../types';
import { analyzeWindForActivity } from '../lib/windAnalysis';
import * as LucideIcons from 'lucide-react';
import { useMemo } from 'react';

interface WindSummaryProps {
  beach: Beach;
  selectedActivity: ActivityId;
}

export default function WindSummary({ beach, selectedActivity }: WindSummaryProps) {
  const windAnalysis = useMemo(() => analyzeWindForActivity(selectedActivity, beach.forecast), [beach, selectedActivity]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'stronger': return <LucideIcons.TrendingUp size={16} />;
      case 'weaker': return <LucideIcons.TrendingDown size={16} />;
      case 'shifting': return <LucideIcons.Move size={16} />;
      default: return <LucideIcons.Minus size={16} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'stronger': return 'bg-rose-50 text-rose-500 border-rose-100';
      case 'weaker': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'shifting': return 'bg-amber-50 text-amber-500 border-amber-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'stronger': return 'מתחזקת';
      case 'weaker': return 'נחלשת';
      case 'shifting': return 'משנה כיוון';
      default: return 'יציב';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/30 overflow-hidden relative" dir="rtl">
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex-1 min-w-[120px]">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">עוצמת הרוח</div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900">{windAnalysis.speed}</span>
            <span className="text-sm font-black text-slate-400 uppercase">km/h</span>
          </div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">כיוון נוכחי</div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
               <LucideIcons.Compass size={20} />
            </div>
            <span className="text-xl font-black text-slate-800">{windAnalysis.direction}</span>
          </div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">מגמת השתנות</div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-sm ${getTrendColor(windAnalysis.trend)}`}>
            {getTrendIcon(windAnalysis.trend)}
            {getTrendLabel(windAnalysis.trend)}
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50 relative">
        <LucideIcons.Quote className="absolute top-4 left-4 text-slate-200" size={24} />
        <p className="text-slate-600 font-medium leading-relaxed text-lg italic">
          {windAnalysis.explanation}
        </p>
        
        {windAnalysis.changeTime && (
          <div className="mt-4 flex items-center gap-2 text-amber-600">
            <LucideIcons.AlertTriangle size={14} />
            <span className="text-xs font-black">שינוי משמעותי צפוי סביב {windAnalysis.changeTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}
