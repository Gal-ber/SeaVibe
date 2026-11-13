// תיבת "תובנה מהירה" מעל הטבלה השעתית. הטקסט מחושב ב-src/lib/hourlyInsight.ts.
import { Icons as LucideIcons } from './icons';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nProvider';

export default function HourlyInsight({ insight }: { insight: string }) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={insight}
      className="bg-sea-50/50 border border-sea-100 rounded-3xl p-5 flex gap-4 items-start"
    >
      <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-sea-500 shrink-0">
        <LucideIcons.Sparkles size={20} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-sea-700 uppercase tracking-widest block">{t('insight.title')}</span>
        <p data-testid="hourly-insight" className="text-sm font-medium text-slate-700 leading-relaxed">{insight}</p>
      </div>
    </motion.div>
  );
}
