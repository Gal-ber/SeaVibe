// ניתוח הרוח לפי פעילות: משפט על המגמה ומשפט על ההשפעה על הפעילות שנבחרה, בשפה הנבחרת.
// הדירוג (נוח / סביר / לא נוח) מגיע מאותם ספים של מנוע הציון (config/scoring.json),
// כך שהניתוח לעולם לא סותר את הציון. מגמת הרוח מחושבת ב-src/engine/forecastView.ts.
// מתי נוגעים: כשמשנים את ניסוח ניתוח הרוח (הטקסטים ב-config/texts).
import { ActivityId, BeachForecast, WindAnalysis } from '../types';
import { SCORING } from '../engine/scoringConfig';
import { rateValue } from '../engine/scoring';
import { Lang, translate } from '../i18n/translate';

export function analyzeWindForActivity(activity: ActivityId, forecast: BeachForecast, lang: Lang = 'he'): WindAnalysis {
  const t = (key: string) => translate(lang, key);
  const { windAnalysis } = forecast;

  // אין נתוני רוח: לא ממציאים כיוון או עוצמה
  if (!windAnalysis || windAnalysis.speed === null) {
    return { speed: null, direction: null, trend: 'stable', explanation: t('wind.noData'), impact: '' };
  }

  const rule = SCORING.activities[activity].windSpeed;
  let impact = t('wind.impact.notScored');
  if (rule) {
    const { rating, side } = rateValue(windAnalysis.speed, rule);
    if (rating === 'comfortable') impact = t('wind.impact.comfortable');
    else if (rating === 'acceptable') impact = t('wind.impact.acceptable');
    else impact = side === 'low' ? t('wind.impact.uncomfortable.low') : t('wind.impact.uncomfortable.high');
  }

  return { ...windAnalysis, impact, explanation: `${t(`wind.text.${windAnalysis.trend}`)} ${impact}` };
}
