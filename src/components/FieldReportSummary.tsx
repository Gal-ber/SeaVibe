// סיכום דיווחי השטח של חוף ופעילות. כללי הסיכום ב-src/lib/fieldReports.ts.
import * as LucideIcons from 'lucide-react';
import { FieldReportSummary } from '../types';
import { useI18n } from '../i18n/I18nProvider';

export default function FieldReportSummaryView({ summary, mode }: { summary: FieldReportSummary; mode: 'local' | 'remote' }) {
  const { t } = useI18n();
  const { totalReports, summaryText, topReasons } = summary;
  return (
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl bg-sea-50 flex items-center justify-center text-sea-500 shrink-0">
        <LucideIcons.MessageSquare size={24} aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-2">
        <p data-testid="reports-summary" className="text-base font-black text-slate-800 leading-snug">{summaryText}</p>
        <div className="flex items-center gap-3 flex-wrap">
          {totalReports >= 5 && (
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
              {t('reports.count', { n: totalReports })}
            </span>
          )}
          {topReasons.map((reason) => (
            <span key={reason} className="text-[10px] font-black text-sea-700">#{t(reason)}</span>
          ))}
        </div>
        <p className="text-xs font-bold text-slate-600">{t(mode === 'local' ? 'reports.local' : 'reports.remote')}. {t('reports.noScoreEffect')}</p>
      </div>
    </div>
  );
}
