// בונה את ההמלצה שהמסך מציג: ציון, סטטוס, כותרת, הסבר מבוסס כללים וחלון זמן.
// כל משפט בהסבר נובע מדירוג שהמנוע נתן בפועל (scoring.ts). אין כאן טקסט שלא קשור לנתונים.
// הטקסטים עצמם נמצאים ב-config/texts/he.json.
// מתי נוגעים: כשמשנים מה מופיע בהסבר. ספים משנים ב-config/scoring.json.
import texts from '../../config/texts/he.json';
import { ActivityId, BeachForecast, BeachRecommendation } from '../types';
import { formatValue, DisplayKind } from '../lib/formatValue';
import { ParamRating, scoreHour } from './scoring';
import { SCORING, ScoredParam } from './scoringConfig';
import { findBestWindow } from './timeWindow';

type TextKey = keyof typeof texts;
const t = (key: string, vars: Record<string, string> = {}) =>
  Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), (texts as Record<string, string>)[key as TextKey] ?? key);

const KIND: Record<ScoredParam, DisplayKind> = {
  waveHeight: 'waveHeight', windSpeed: 'windSpeed', airTemperature: 'temperature', waterTemperature: 'temperature',
};

export function factorText(r: ParamRating): string {
  const key = r.rating === 'comfortable' ? `factor.${r.param}.comfortable` : `factor.${r.param}.${r.rating}.${r.side}`;
  return t(key, { value: formatValue(KIND[r.param], r.value) });
}

// ציון לכל שעה בסדרה, לפעילות שנבחרה (לטבלה ולחלון הזמן)
export function hourlyScores(forecast: BeachForecast, activity: ActivityId) {
  return forecast.hourlyForecast.map((h) => ({ time: h.time, score: scoreHour(h, activity).score }));
}

export function getRecommendation(forecast: BeachForecast, activity: ActivityId): BeachRecommendation | null {
  const now = forecast.hourlyForecast.find((h) => h.time === forecast.currentTime);
  if (!now) return null;
  const result = scoreHour(now, activity);
  if (result.score === null || result.status === null) return null;

  // הגורם הכבד ביותר מופיע ראשון
  const byWeight = [...result.ratings].sort((a, b) => b.weight - a.weight);
  const positiveFactors = byWeight.filter((r) => r.rating === 'comfortable').map(factorText);
  const negativeFactors = byWeight.filter((r) => r.rating !== 'comfortable').map(factorText);
  if (result.rainPenalty && now.precipitationChance !== null) {
    negativeFactors.push(t('factor.rain', { value: String(now.precipitationChance) }));
  }
  const missingNotes = result.missing.map((p) => t(`missing.${p}`));

  const summary = [
    negativeFactors.length === 0 ? t('summary.allGood') : t('summary.mixed'),
    result.capped ? t('summary.capped') : '',
    result.rainPenalty ? t('summary.rain') : '',
    missingNotes.length ? t('summary.partial') : '',
  ].filter(Boolean).join(' ');

  const window = findBestWindow(hourlyScores(forecast, activity), forecast.currentTime);

  return {
    score: result.score,
    status: result.status,
    headline: t(`headline.${activity}.${result.status}`),
    shortExplanation: (negativeFactors[0] ?? positiveFactors[0]) + '.',
    bestTimeWindow: window ? `${window.start}–${window.end}` : null,
    positiveFactors,
    negativeFactors: [...negativeFactors, ...missingNotes],
    explanationSummary: summary,
    confidence: result.missing.length ? 'partial' : 'full',
    scoringVersion: SCORING.version,
  };
}
