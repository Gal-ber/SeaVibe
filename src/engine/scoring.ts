// מנוע הציון: מדרג כל נתון (נוח / סביר / לא נוח) ומחשב ציון 0–100 לשעה אחת ופעילות אחת.
// כל הספים מגיעים מ-config/scoring.json. אין כאן מספרים קבועים של ספים.
// נתון חשוב שחסר (משקל 30% ומעלה) = אין ציון ("אין מספיק מידע").
// נתון פחות חשוב שחסר לא נכנס לחישוב, וההמלצה מסומנת "חלקית".
// מתי נוגעים: רק כשמשנים את שיטת החישוב. שינוי ספים נעשה בקובץ ההגדרות, לא כאן.
import { ActivityId, HourlyForecast, ScoreStatus } from '../types';
import { SCORING, ParamRule, Range, ScoredParam, rulesFor } from './scoringConfig';

export type Rating = 'comfortable' | 'acceptable' | 'uncomfortable';
export type Side = 'low' | 'high' | null;

export interface ParamRating {
  param: ScoredParam;
  value: number;
  rating: Rating;
  side: Side;
  weight: number;
}

export interface HourScore {
  score: number | null;
  status: ScoreStatus | null;
  ratings: ParamRating[];
  missing: ScoredParam[];
  capped: boolean;
  rainPenalty: number | null;
}

const inRange = (v: number, r: Range) => (r.min === undefined || v >= r.min) && (r.max === undefined || v <= r.max);
const sideOf = (v: number, r: Range): Side => (r.min !== undefined && v < r.min ? 'low' : 'high');

export function rateValue(value: number, rule: ParamRule): { rating: Rating; side: Side } {
  if (inRange(value, rule.comfortable)) return { rating: 'comfortable', side: null };
  if (inRange(value, rule.acceptable)) return { rating: 'acceptable', side: sideOf(value, rule.comfortable) };
  return { rating: 'uncomfortable', side: sideOf(value, rule.acceptable) };
}

export function statusFor(score: number): ScoreStatus {
  const s = SCORING.status;
  if (score >= s.excellent) return 'excellent';
  if (score >= s.good) return 'good';
  if (score >= s.fair) return 'fair';
  return 'poor';
}

export function scoreHour(hour: HourlyForecast, activity: ActivityId): HourScore {
  const ratings: ParamRating[] = [];
  const missing: ScoredParam[] = [];
  let criticalMissing = false;

  for (const [param, rule] of rulesFor(activity)) {
    const value = hour[param];
    if (value === null) {
      missing.push(param);
      if (rule.weight >= SCORING.cap.minWeight) criticalMissing = true;
      continue;
    }
    ratings.push({ param, value, weight: rule.weight, ...rateValue(value, rule) });
  }

  if (criticalMissing || ratings.length === 0) {
    return { score: null, status: null, ratings, missing, capped: false, rainPenalty: null };
  }

  const totalWeight = ratings.reduce((sum, r) => sum + r.weight, 0);
  let score = ratings.reduce((sum, r) => sum + SCORING.points[r.rating] * r.weight, 0) / totalWeight;

  const capped = ratings.some((r) => r.rating === 'uncomfortable' && r.weight >= SCORING.cap.minWeight);
  if (capped) score = Math.min(score, SCORING.cap.maxScore);

  const rain = hour.precipitationChance;
  const rainPenalty = rain !== null && rain > SCORING.rain.above ? SCORING.rain.penalty : null;
  if (rainPenalty) score -= rainPenalty;

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, status: statusFor(score), ratings, missing, capped, rainPenalty };
}
