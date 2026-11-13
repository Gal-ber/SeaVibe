// מסך הפירוט של חוף: סיכום ההמלצה, דיווחי שטח, טבלה שעתית, ניתוח רוח והסבר הציון.
// כל המספרים כאן מאותה סדרה שעתית כמו הכרטיס במסך הראשי.
// מתי נוגעים: כשמוסיפים או מסדרים חלקים במסך. כל חלק גדול נמצא בקובץ משלו ב-detail/.
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Beach, ActivityId, BeachRecommendation, SelectedParameter, FieldReport } from '../types';
import WindSummary from './WindSummary';
import ParameterCard from './ParameterCard';
import HourlyForecastTable from './HourlyForecastTable';
import HourlyInsight from './HourlyInsight';
import FieldReportSummaryView from './FieldReportSummary';
import FieldReportActions from './FieldReportActions';
import DynamicSeaBackground from './DynamicSeaBackground';
import SectionHeader from './detail/SectionHeader';
import RecommendationSummary from './detail/RecommendationSummary';
import WhySection from './detail/WhySection';
import { generateHourlyInsight } from '../lib/hourlyInsight';
import { getRecentFieldReports, summarizeFieldReports } from '../lib/fieldReports';
import { getBackgroundState } from '../lib/utils';
import { formatValue } from '../lib/formatValue';
import { hourlyScores } from '../engine/recommend';
import { beachName } from '../data/beaches';
import { useI18n } from '../i18n/I18nProvider';

interface DetailedBeachViewProps {
  beach: Beach;
  recommendation: BeachRecommendation | null;
  isMock: boolean;
  selectedActivity: ActivityId;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export default function DetailedBeachView({ beach, recommendation, isMock, selectedActivity, isFavorite, onToggleFavorite, onClose }: DetailedBeachViewProps) {
  const { t, lang } = useI18n();
  const [selectedParam, setSelectedParam] = useState<SelectedParameter>('waveHeight');
  const [reports, setReports] = useState<FieldReport[]>([]);
  const f = beach.forecast;
  const activityLabel = t(`activity.${selectedActivity}`);

  const parameterOptions: { id: SelectedParameter; label: string; icon: string; value: string }[] = [
    { id: 'waveHeight', label: t('param.waveHeight'), icon: 'Waves', value: formatValue('waveHeight', f.waveHeight, lang) },
    { id: 'wind', label: t('param.wind'), icon: 'Wind', value: formatValue('windSpeed', f.windSpeed, lang) },
    { id: 'airTemperature', label: t('param.airTemperature'), icon: 'Thermometer', value: formatValue('temperature', f.temperature, lang) },
    { id: 'waterTemperature', label: t('param.waterTemperature'), icon: 'Droplets', value: formatValue('temperature', f.waterTemp, lang) },
  ];

  // התובנה מסתכלת על השעות מעכשיו ועד סוף היום
  const hours = f.hourlyForecast;
  const nowIndex = hours.findIndex((h) => h.time === f.currentTime);
  const insight = generateHourlyInsight(selectedParam, nowIndex >= 0 ? hours.slice(nowIndex) : hours, selectedActivity, lang);
  const scores = useMemo(() => hourlyScores(f, selectedActivity), [f, selectedActivity]);

  const reportSummary = useMemo(
    () => summarizeFieldReports(getRecentFieldReports(reports, beach.id, selectedActivity), activityLabel, lang),
    [reports, beach.id, selectedActivity, activityLabel, lang],
  );

  const handleSubmitReport = (isAccurate: boolean, reason?: string) => {
    const report: FieldReport = { id: crypto.randomUUID(), beachId: beach.id, activity: selectedActivity, isAccurate, reason, createdAt: new Date().toISOString() };
    setReports((prev) => [report, ...prev]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto pb-20"
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
        <RecommendationSummary recommendation={recommendation} isMock={isMock} />

        <section className="space-y-6">
          <SectionHeader icon="BarChart3" title={t('detail.hourly.title')} subtitle={t('detail.hourly.subtitle')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {parameterOptions.map((opt) => (
              <ParameterCard key={opt.id} {...opt} isSelected={selectedParam === opt.id} onClick={setSelectedParam} />
            ))}
          </div>
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-4 sm:p-6 border border-white shadow-xl shadow-slate-200/40">
            <HourlyInsight insight={insight} />
            <div className="mt-6">
              <HourlyForecastTable data={hours} scores={scores} currentTime={f.currentTime} selectedParameter={selectedParam} />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader icon="Wind" title={t('detail.wind.title')} subtitle={t('detail.wind.subtitle')} />
          <WindSummary beach={beach} selectedActivity={selectedActivity} />
        </section>

        {recommendation && <WhySection recommendation={recommendation} />}

        <section className="space-y-6">
          <SectionHeader icon="Users" title={t('detail.reports.title')} subtitle={t('detail.reports.subtitle')} />
          <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white shadow-xl shadow-slate-200/30">
            <FieldReportSummaryView summary={reportSummary} />
            <div className="mt-8 pt-8 border-t border-slate-100">
              <FieldReportActions activityLabel={activityLabel} onSubmit={handleSubmitReport} />
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
