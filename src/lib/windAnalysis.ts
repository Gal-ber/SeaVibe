// ניתוח הרוח לפי פעילות: מוסיף להסבר משפט על השפעת הרוח על הפעילות שנבחרה.
// הדירוג (נוח / סביר / לא נוח) מגיע מאותם ספים של מנוע הציון (config/scoring.json),
// כך שהניתוח לעולם לא סותר את הציון. מגמת הרוח מחושבת ב-src/engine/forecastView.ts.
// מתי נוגעים: כשמשנים את ניסוח ניתוח הרוח (הטקסטים ב-config/texts/he.json).
import texts from '../../config/texts/he.json';
import { ActivityId, BeachForecast, WindAnalysis } from '../types';
import { SCORING } from '../engine/scoringConfig';
import { rateValue } from '../engine/scoring';

export function analyzeWindForActivity(activity: ActivityId, forecast: BeachForecast): WindAnalysis {
  const { windAnalysis } = forecast;

  // אין נתוני רוח: לא ממציאים כיוון או עוצמה
  if (!windAnalysis || windAnalysis.speed === null) {
    return { speed: null, direction: null, trend: 'stable', explanation: 'אין מספיק נתוני רוח לניתוח.', impact: 'לא ידוע' };
  }

  const rule = SCORING.activities[activity].windSpeed;
  let impact = texts['wind.impact.notScored'];
  if (rule) {
    const { rating, side } = rateValue(windAnalysis.speed, rule);
    if (rating === 'comfortable') impact = texts['wind.impact.comfortable'];
    else if (rating === 'acceptable') impact = texts['wind.impact.acceptable'];
    else impact = side === 'low' ? texts['wind.impact.uncomfortable.low'] : texts['wind.impact.uncomfortable.high'];
  }

  return { ...windAnalysis, impact, explanation: `${windAnalysis.explanation} ${impact}` };
}
