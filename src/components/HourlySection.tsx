// החלק השעתי: בחירת נתון (גלים / רוח / אוויר / מים), תובנה מהירה וטבלת שעות עם ציון.
// מופיע במסך הפירוט, ובמחשב גם בעמודה השנייה של המסך הראשי (ליד כרטיס הציון).
// מתי נוגעים: כשמשנים את מבנה הטבלה או את בחירת הנתון.
import { useMemo, useState } from 'react';
import { ActivityId, Beach, SelectedParameter } from '../types';
import ParameterCard from './ParameterCard';
import HourlyForecastTable from './HourlyForecastTable';
import HourlyInsight from './HourlyInsight';
import SectionHeader from './detail/SectionHeader';
import { generateHourlyInsight } from '../lib/hourlyInsight';
import { formatValue } from '../lib/formatValue';
import { hourlyScores } from '../engine/recommend';
import { useI18n } from '../i18n/I18nProvider';

export default function HourlySection({ beach, activity }: { beach: Beach; activity: ActivityId }) {
  const { t, lang } = useI18n();
  const [selectedParam, setSelectedParam] = useState<SelectedParameter>('waveHeight');
  const f = beach.forecast;

  const options: { id: SelectedParameter; label: string; icon: string; value: string }[] = [
    { id: 'waveHeight', label: t('param.waveHeight'), icon: 'Waves', value: formatValue('waveHeight', f.waveHeight, lang) },
    { id: 'wind', label: t('param.wind'), icon: 'Wind', value: formatValue('windSpeed', f.windSpeed, lang) },
    { id: 'airTemperature', label: t('param.airTemperature'), icon: 'Thermometer', value: formatValue('temperature', f.temperature, lang) },
    { id: 'waterTemperature', label: t('param.waterTemperature'), icon: 'Droplets', value: formatValue('temperature', f.waterTemp, lang) },
  ];

  // התובנה מסתכלת על השעות מעכשיו ועד סוף היום
  const hours = f.hourlyForecast;
  const nowIndex = hours.findIndex((h) => h.time === f.currentTime);
  const insight = generateHourlyInsight(selectedParam, nowIndex >= 0 ? hours.slice(nowIndex) : hours, activity, lang);
  const scores = useMemo(() => hourlyScores(f, activity), [f, activity]);
  // הטבלה מתחילה שעה לפני עכשיו: השעה הנוכחית היא העוגן, ולא צריך לגלול מחצות
  const tableRows = nowIndex > 0 ? hours.slice(nowIndex - 1) : hours;

  return (
    <section className="space-y-6">
      <SectionHeader icon="BarChart3" title={t('detail.hourly.title')} subtitle={t('detail.hourly.subtitle')} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((opt) => (
          <ParameterCard key={opt.id} {...opt} isSelected={selectedParam === opt.id} onClick={setSelectedParam} />
        ))}
      </div>
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-4 sm:p-6 border border-white shadow-xl shadow-slate-200/40">
        <HourlyInsight insight={insight} />
        <div className="mt-6">
          <HourlyForecastTable data={tableRows} scores={scores} currentTime={f.currentTime} selectedParameter={selectedParam} />
        </div>
      </div>
    </section>
  );
}
