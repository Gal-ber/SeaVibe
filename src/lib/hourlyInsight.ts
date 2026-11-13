// תובנה קצרה מעל הטבלה השעתית, מחושבת מהנתונים של השעות הקרובות (מעכשיו עד סוף היום).
// אם חסר נתון שהתובנה צריכה, מוצגת הודעה שאין מספיק נתונים, בלי לנחש.
// מתי נוגעים: כשמשנים את כללי התובנה. הטקסטים נמצאים ב-config/texts.
import { HourlyForecast, SelectedParameter, ActivityId } from '../types';
import { Lang, translate } from '../i18n/translate';

type Trend = 'up' | 'down' | 'stable' | 'unknown';

function trendOf(hours: HourlyForecast[], key: 'waveHeight' | 'windSpeed' | 'airTemperature' | 'waterTemperature'): Trend {
  const start = hours[0][key];
  const end = hours[hours.length - 1][key];
  if (start === null || end === null) return 'unknown';
  const diff = end - start;
  const step = key === 'waveHeight' ? 0.1 : key === 'waterTemperature' ? 1 : 2;
  if (Math.abs(diff) < step) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

export function generateHourlyInsight(
  selectedParameter: SelectedParameter,
  hours: HourlyForecast[],
  activity?: ActivityId,
  lang: Lang = 'he',
): string {
  const t = (key: string) => translate(lang, key);
  if (!hours || hours.length < 2) return t('insight.stable');

  if (selectedParameter === 'waveHeight') {
    const trend = trendOf(hours, 'waveHeight');
    if (trend === 'unknown') return t('insight.insufficient');
    const surfer = activity === 'surf' || activity === 'sail';
    if (trend === 'up') return t(surfer ? 'insight.waves.upSurf' : 'insight.waves.up');
    if (trend === 'down') return t(surfer ? 'insight.waves.downSurf' : 'insight.waves.down');
    return t('insight.waves.stable');
  }

  if (selectedParameter === 'wind') {
    const trend = trendOf(hours, 'windSpeed');
    if (trend === 'unknown') return t('insight.insufficient');
    const calmActivity = activity === 'sup' || activity === 'swim' || activity === 'kids';
    if (trend === 'up') return t(calmActivity ? 'insight.wind.upCalm' : 'insight.wind.up');
    if (trend === 'down') return t('insight.wind.down');
    const first = hours[0].windDirection;
    const last = hours[hours.length - 1].windDirection;
    if (first !== null && last !== null && first !== last) return t('insight.wind.shift');
    return t('insight.wind.stable');
  }

  if (selectedParameter === 'airTemperature') {
    const trend = trendOf(hours, 'airTemperature');
    if (trend === 'unknown') return t('insight.insufficient');
    const peak = Math.max(...hours.map((h) => h.airTemperature ?? -Infinity));
    if (trend === 'up' && peak > 28) return t('insight.air.hot');
    if (trend === 'up') return t('insight.air.up');
    if (trend === 'down') return t('insight.air.down');
    return t('insight.air.stable');
  }

  // טמפרטורת מים
  if (hours.some((h) => h.waterTemperature === null)) return t('insight.insufficient');
  return t(trendOf(hours, 'waterTemperature') === 'stable' ? 'insight.water.stable' : 'insight.water.changes');
}
