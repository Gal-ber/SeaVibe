/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// ניתוח הרוח לפי פעילות: מוסיף להסבר משפט על ההשפעה על הפעילות שנבחרה.
// מגמת הרוח עצמה מחושבת מהנתונים ב-src/engine/forecastView.ts.

import { ActivityId, BeachForecast, WindAnalysis } from '../types';

export function analyzeWindForActivity(activity: ActivityId, forecast: BeachForecast): WindAnalysis {
  const { windAnalysis } = forecast;

  // אין נתוני רוח: לא ממציאים כיוון או עוצמה
  if (!windAnalysis || windAnalysis.speed === null) {
    return {
      speed: null,
      direction: null,
      trend: 'stable',
      explanation: 'אין מספיק נתוני רוח לניתוח.',
      impact: 'לא ידוע'
    };
  }

  const { trend, explanation } = windAnalysis;
  const speed = windAnalysis.speed;

  let activityImpact = '';
  switch (activity) {
    case 'sup':
      if (speed > 15) activityImpact = 'קושי משמעותי בחתירה וסכנת סחיפה';
      else if (trend === 'stronger') activityImpact = 'עדיף לחתור מוקדם לפני שהרוח עולה';
      else activityImpact = 'תנאים נוחים לחתירה';
      break;
    case 'swim':
      if (speed > 20) activityImpact = 'ים קופצני ופחות נעים לשחייה';
      else activityImpact = 'תנאי שחייה טובים';
      break;
    case 'kids':
      if (speed > 15) activityImpact = 'רוח מציקה שמרימה חול ומקררת';
      else activityImpact = 'נעים ורגוע לקטנים';
      break;
    case 'surf':
      if (speed < 10) activityImpact = 'ים "נקי" ונוח לגלישה';
      else if (speed > 25) activityImpact = 'ים מבולגן וקשה לשליטה';
      else activityImpact = 'גלים מורגשים, רוח משפיעה על איכות הגל';
      break;
    case 'sail':
      if (speed < 8) activityImpact = 'רוח חלשה מדי לשיוט מפרשים';
      else if (speed > 30) activityImpact = 'רוח חזקה ומסוכנת לשייט קצר';
      else activityImpact = 'תנאי רוח אידיאליים לשייט';
      break;
    case 'beach':
    default:
      if (speed > 20) activityImpact = 'רוח חזקה שמרימה חול ומעמידה מחצלות במבחן';
      else activityImpact = 'בריזה נעימה בחוף';
      break;
  }

  return {
    ...windAnalysis,
    impact: activityImpact,
    explanation: `${explanation} ${activityImpact}.`
  };
}
