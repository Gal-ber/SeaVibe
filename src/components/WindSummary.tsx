// ניתוח הרוח במסך הפירוט: עוצמה, כיוון, מגמה ומשפט על ההשפעה על הפעילות.
// הנתונים מגיעים מאותה סדרה שעתית כמו הכרטיס. הניתוח עצמו ב-src/lib/windAnalysis.ts.
import { useMemo } from 'react';
import { Icons as LucideIcons, IconName } from './icons';
import { Beach, ActivityId, WindTrend } from '../types';
import { analyzeWindForActivity } from '../lib/windAnalysis';
import { formatNumber, unavailable } from '../lib/formatValue';
import { useI18n } from '../i18n/I18nProvider';

const TREND_ICON: Record<WindTrend, IconName> = {
  stronger: 'TrendingUp', weaker: 'TrendingDown', shifting: 'Move', stable: 'Minus',
};
const TREND_COLOR: Record<WindTrend, string> = {
  stronger: 'bg-rose-50 text-rose-700 border-rose-100',
  weaker: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  shifting: 'bg-amber-50 text-amber-800 border-amber-100',
  stable: 'bg-slate-50 text-slate-700 border-slate-100',
};

export default function WindSummary({ beach, selectedActivity }: { beach: Beach; selectedActivity: ActivityId }) {
  const { t, lang } = useI18n();
  const wind = useMemo(() => analyzeWindForActivity(selectedActivity, beach.forecast, lang), [beach, selectedActivity, lang]);
  const TrendIcon = LucideIcons[TREND_ICON[wind.trend]];

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/30">
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex-1 min-w-[120px]">
          <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('wind.speed')}</div>
          <div className="flex items-baseline gap-1">
            <span data-testid="wind-speed" className="text-4xl font-black text-slate-900">{formatNumber('windSpeed', wind.speed, lang)}</span>
            {wind.speed !== null && <span className="text-sm font-black text-slate-600">{t('unit.kmh')}</span>}
          </div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('wind.direction')}</div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
              <LucideIcons.Compass size={20} aria-hidden="true" />
            </div>
            <span className="text-xl font-black text-slate-800">{wind.direction ? t(`compass.${wind.direction}`) : unavailable(lang)}</span>
          </div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('wind.trend')}</div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-sm ${TREND_COLOR[wind.trend]}`}>
            <TrendIcon size={16} aria-hidden="true" />
            {t(`wind.trend.${wind.trend}`)}
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50">
        <p className="text-slate-700 font-medium leading-relaxed text-lg">{wind.explanation}</p>
        {wind.changeTime && (
          <div className="mt-4 flex items-center gap-2 text-amber-800">
            <LucideIcons.Clock size={14} aria-hidden="true" />
            <span className="text-xs font-black">{t('wind.changeAt', { time: wind.changeTime })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
