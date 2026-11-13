// "למה קיבלתי את ההמלצה הזו?": הגורמים שבאמת השפיעו על הציון, וסיכום קצר.
import { Icons as LucideIcons } from '../icons';
import { BeachRecommendation } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import SectionHeader from './SectionHeader';

function FactorList({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'bad' }) {
  if (items.length === 0) return null;
  const Icon = tone === 'good' ? LucideIcons.CheckCircle2 : LucideIcons.AlertCircle;
  return (
    <div className="flex-1">
      <h4 className={`text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${tone === 'good' ? 'text-emerald-700' : 'text-rose-700'}`}>
        <Icon size={16} aria-hidden="true" />
        {title}
      </h4>
      <ul className="space-y-3">
        {items.map((factor) => (
          <li key={factor} className="text-sm font-bold text-slate-800 flex items-start gap-3">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${tone === 'good' ? 'bg-emerald-500' : 'bg-rose-400'}`} aria-hidden="true" />
            <span>{factor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WhySection({ recommendation }: { recommendation: BeachRecommendation }) {
  const { t } = useI18n();
  return (
    <section className="space-y-6">
      <SectionHeader icon="Info" title={t('detail.why.title')} subtitle={t('detail.why.subtitle')} />
      <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 border border-white shadow-xl shadow-slate-200/40 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <FactorList title={t('detail.why.positive')} items={recommendation.positiveFactors} tone="good" />
          <FactorList title={t('detail.why.negative')} items={recommendation.negativeFactors} tone="bad" />
        </div>
        <p className="pt-6 border-t border-slate-100 text-center text-slate-700 text-sm font-bold leading-relaxed">
          {recommendation.explanationSummary}
        </p>
        <p className="text-center text-[11px] font-bold text-slate-600">{t('detail.engine', { version: recommendation.scoringVersion })}</p>
      </div>
    </section>
  );
}
