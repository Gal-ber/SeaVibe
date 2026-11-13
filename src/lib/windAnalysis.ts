/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityId, BeachForecast, WindAnalysis } from '../types';

export function analyzeWindForActivity(activity: ActivityId, forecast: BeachForecast): WindAnalysis {
  const { windSpeed, windAnalysis } = forecast;
  
  if (!windAnalysis) {
    return {
      speed: windSpeed,
      direction: 'מערבית',
      trend: 'stable',
      explanation: 'אין מספיק נתוני רוח לניתוח מעמיק.',
      impact: 'לא ידוע'
    };
  }

  const { trend, speed, direction, changeTime, explanation } = windAnalysis;

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
