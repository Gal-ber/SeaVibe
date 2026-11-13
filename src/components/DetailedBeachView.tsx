// מסך הפירוט של חוף: סיכום ההמלצה, דיווחי שטח, טבלה שעתית, ניתוח רוח והסבר הציון.
// כל המספרים כאן מאותה סדרה שעתית כמו הכרטיס במסך הראשי.
// מתי נוגעים: כשמוסיפים או מסדרים חלקים במסך. כל חלק גדול נמצא בקובץ משלו ב-detail/.
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Beach, ActivityId, BeachRecommendation } from '../types';
import WindSummary from './WindSummary';
import HourlySection from './HourlySection';
import FieldReportSummaryView from './FieldReportSummary';
import FieldReportActions from './FieldReportActions';
import DynamicSeaBackground from './DynamicSeaBackground';
import SectionHeader from './detail/SectionHeader';
import RecommendationSummary from './detail/RecommendationSummary';
import WhySection from './detail/WhySection';
import { summarizeCounts } from '../lib/fieldReports';
import { useFieldReports } from '../lib/useFieldReports';
import { getBackgroundState } from '../lib/utils';
import { beachName } from '../data/beaches';
import { useI18n } from '../i18n/I18nProvider';

interface DetailedBeachViewProps {
  beach: Beach;
  recommendation: BeachRecommendation | null;
  isMock: boolean;
  generatedAt: string | null;
  selectedActivity: ActivityId;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export default function DetailedBeachView({ beach, recommendation, isMock, generatedAt, selectedActivity, isFavorite, onToggleFavorite, onClose }: DetailedBeachViewProps) {
  const { t, lang } = useI18n();
  const reports = useFieldReports(beach.id, selectedActivity);
  const activityLabel = t(`activity.${selectedActivity}`);

  const reportSummary = reports.counts ? summarizeCounts(reports.counts, activityLabel, lang) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="safe-area fixed inset-0 z-[100] bg-slate-50 overflow-y-auto pb-20"
      role="dialog"
      aria-modal="true"
      aria-label={`${t('detail.title')}: ${beachName(beach, lang)}`}
    >
      <div className="fixed inset-0 -z-10 h-1/2">
        <DynamicSeaBackground state={getBackgroundState(beach)} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50" />
      </div>

      <div className="sticky top-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <button onClick={onClose} aria-label={t('nav.back')} className="w-12 h-12 rounded-[1.25rem] bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 border border-white/50 shadow-sm hover:bg-white transition-colors">
          <LucideIcons.ChevronRight size={24} className="ltr:rotate-180" aria-hidden="true" />
        </button>
        <div className="flex flex-col items-center min-w-0">
          <div className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-0.5">{t('detail.title')}</div>
          <h2 className="text-xl font-black text-slate-900 truncate">{beachName(beach, lang)}</h2>
        </div>
        <button
          onClick={onToggleFavorite}
          aria-label={t(isFavorite ? 'aria.favoriteRemove' : 'aria.favoriteAdd')}
          aria-pressed={isFavorite}
          className={`w-12 h-12 rounded-[1.25rem] bg-white/90 backdrop-blur-md flex items-center justify-center transition-all border border-white/50 shadow-sm ${isFavorite ? 'text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <LucideIcons.Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-12 mt-4 relative z-10">
        <RecommendationSummary recommendation={recommendation} isMock={isMock} generatedAt={generatedAt} />
        <p data-testid="disclaimer" className="text-sm font-bold text-slate-700 bg-white/80 rounded-2xl p-4 border border-slate-200">{t('disclaimer')}</p>

        <HourlySection beach={beach} activity={selectedActivity} />

        <section className="space-y-6">
          <SectionHeader icon="Wind" title={t('detail.wind.title')} subtitle={t('detail.wind.subtitle')} />
          <WindSummary beach={beach} selectedActivity={selectedActivity} />
        </section>

        {recommendation && <WhySection recommendation={recommendation} />}

        <section className="space-y-6">
          <SectionHeader icon="Users" title={t('detail.reports.title')} subtitle={t('detail.reports.subtitle')} />
          <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white shadow-xl shadow-slate-200/30">
            {reportSummary && <FieldReportSummaryView summary={reportSummary} mode={reports.mode} />}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <FieldReportActions
                key={`${beach.id}-${selectedActivity}`}
                activityLabel={activityLabel}
                existingVote={reports.myVote ? reports.myVote.isAccurate : null}
                mode={reports.mode}
                onSubmit={reports.submit}
              />
            </div>
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-lg rounded-[2.5rem] p-10 text-center border-2 border-dashed border-slate-200">
          <LucideIcons.MapPin className="text-slate-400 mx-auto mb-4" size={32} aria-hidden="true" />
          <h3 className="font-black text-xl text-slate-800 mb-2">{t('detail.map.title')}</h3>
          <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">{t('detail.map.body')}</p>
        </section>
      </div>
    </motion.div>
  );
}
