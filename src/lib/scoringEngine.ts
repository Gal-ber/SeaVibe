/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BeachForecast, ActivityId, BeachRecommendation } from '../types';
import { TEMPLATES } from './recommendationTemplates';

// מנוע הציון: מחשב ציון התאמה (0–100) לפעילות לפי נתוני השעה הנוכחית.
// אם חסר נתון קריטי (גלים, רוח או טמפ׳ אוויר) מוחזר null, והמסך מציג "אין מספיק מידע".
// נתון לא קריטי שחסר (UV, גשם) פשוט לא נכנס לחישוב ולא מוצג כגורם.
// מתי נוגעים: שלב 2 (ספי ציון). רק דרך הסוכן.
export function getRecommendation(
  forecast: BeachForecast,
  selectedActivity: ActivityId
): BeachRecommendation | null {
  const { waveHeight, windSpeed, temperature, uvIndex, precipitationChance } = forecast;
  if (waveHeight === null || windSpeed === null || temperature === null) return null;
  
  let score = 50; // Base score
  const riskFlags: string[] = [];

  // Helper to add risk flags
  const addRisk = (flag: string) => {
    if (!riskFlags.includes(flag)) riskFlags.push(flag);
  };

  // 1. Weather Penalty (Global)
  if (precipitationChance !== null && precipitationChance > 40) score -= 30;
  if (uvIndex !== null && uvIndex >= 8) addRisk('קרינה חזקה');
  if (temperature > 32) addRisk('עומס חום כבד');
  if (temperature < 15) addRisk('קר במיוחד');

  // 2. Activity Specific Scoring Logic
  switch (selectedActivity) {
    case 'surf':
      // Ideal: 0.6m - 1.5m waves, low wind (< 15 km/h)
      if (waveHeight >= 0.6 && waveHeight <= 1.2) {
        score = 90 - (windSpeed > 15 ? (windSpeed - 15) * 2 : 0);
      } else if (waveHeight < 0.4) {
        score = 20; // Too flat
      } else if (waveHeight > 1.5) {
        score = 40; // Too big/dangerous for most
        addRisk('ים גבוה');
      }
      break;

    case 'kids':
      // Ideal: < 0.3m waves, < 12 km/h wind
      if (waveHeight < 0.3 && windSpeed < 12) {
        score = 95;
      } else if (waveHeight > 0.6 || windSpeed > 20) {
        score = 20;
        addRisk('ים לא שקט');
      } else {
        score = 70 - (waveHeight * 50) - (windSpeed / 2);
      }
      break;

    case 'sup':
      // Ideal: < 0.2m waves, < 8 km/h wind
      if (waveHeight < 0.2 && windSpeed < 8) {
        score = 98;
      } else if (windSpeed > 18) {
        score = 15;
        addRisk('סכנת סחיפה');
      } else {
        score = 80 - (waveHeight * 100) - (windSpeed * 1.5);
      }
      break;

    case 'swim':
      // Ideal: < 0.4m waves, < 15 km/h wind
      if (waveHeight < 0.4 && windSpeed < 15) {
        score = 92;
      } else if (waveHeight > 1.2) {
        score = 10;
        addRisk('סכנת טביעה');
      } else {
        score = 75 - (waveHeight * 40);
      }
      break;

    case 'sail':
      // Ideal: 0.4m - 1.0m waves, 10-20 km/h wind
      if (windSpeed >= 10 && windSpeed <= 22 && waveHeight < 1.2) {
        score = 90;
      } else if (windSpeed > 30 || waveHeight > 1.8) {
        score = 20;
        addRisk('ים סוער');
      } else if (windSpeed < 5) {
        score = 40; // No wind
      }
      break;

    case 'beach':
    default:
      // Ideal: 22-28 degrees, < 0.5m waves, low wind
      if (temperature >= 22 && temperature <= 28 && waveHeight < 0.6) {
        score = 95;
      } else if (temperature > 35) {
        score = 50;
      } else if (windSpeed > 25) {
        score = 40;
        addRisk('רוח חזקה');
      }
      break;
  }

  // Ensure score is within 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine Status
  let status: BeachRecommendation['status'] = 'good';
  if (score >= 85) status = 'excellent';
  else if (score >= 60) status = 'good';
  else if (score >= 35) status = 'fair';
  else status = 'poor';

  // Get Template Data
  const template = TEMPLATES[selectedActivity][status];
  
  // 3. Derive positive and negative factors for the Summary section
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];

  // Weather Factors
  if (precipitationChance !== null) {
    if (precipitationChance < 10) positiveFactors.push('אין סיכוי משמעותי לגשם');
    else if (precipitationChance > 40) negativeFactors.push('סיכוי גבוה לגשם');
  }

  if (uvIndex !== null) {
    if (uvIndex < 5) positiveFactors.push('קרינה נמוכה ונוחה');
    else if (uvIndex >= 8) negativeFactors.push('UV גבוה בצהריים');
  }

  if (temperature >= 22 && temperature <= 28) positiveFactors.push('הטמפרטורה נעימה');
  else if (temperature > 32) negativeFactors.push('עומס חום כבד');
  else if (temperature < 18) negativeFactors.push('קריר בחוף');

  // Activity & Marine Factors
  if (selectedActivity === 'surf') {
    if (waveHeight >= 0.6 && waveHeight <= 1.2) positiveFactors.push('הגלים בגובה אידיאלי לגלישה');
    else if (waveHeight < 0.4) negativeFactors.push('הגלים נמוכים מדי לגלישה משמעותית');
    else if (waveHeight > 1.5) negativeFactors.push('הים גבוה ומאתגר מדי');
  } else {
    if (waveHeight < 0.3) positiveFactors.push('הגלים נמוכים ונוחים מאוד');
    else if (waveHeight > 0.8) negativeFactors.push('הים קצת "רועש" וגבוה');
  }

  // Wind Factors
  if (windSpeed < 12) positiveFactors.push('הרוח רגועה בשעות אלו');
  else if (windSpeed > 25) negativeFactors.push('רוח חזקה שעלולה להפריע');

  // Specific wind-related risk flags and trends
  const { windAnalysis } = forecast;
  if (windAnalysis) {
    if (windAnalysis.trend === 'stronger') {
      addRisk('רוח מתחזקת בהמשך היום');
      negativeFactors.push('הרוח מתחזקת בהמשך היום');
      if (selectedActivity === 'sup') addRisk('פחות נוח ל-SUP אחר הצהריים');
      if (selectedActivity === 'kids' || selectedActivity === 'swim') addRisk('עדיף להגיע מוקדם לפני שהרוח עולה');
    }
    if (windAnalysis.speed !== null && windAnalysis.speed > 20) addRisk('רוח חזקה יחסית');
    const direction = windAnalysis.direction ?? '';
    if (direction.includes('דרום') || direction.includes('צפון')) {
       if (selectedActivity === 'sail' || selectedActivity === 'surf') addRisk('רוח צד שעשויה להפריע');
    }
  }

  // Randomly pick from headlines and explanations for variety
  const headline = template.headlines[0];
  const shortExplanation = template.explanations[0];

  // 4. Summary Construction
  const bestTime = getBestTimeWindow(selectedActivity, temperature);
  let summary = `בגדול, הבוקר נראה ${status === 'excellent' || status === 'good' ? 'טוב' : 'פחות אידיאלי'} ל${template.headlines[0].split(',')[0]}. `;
  
  if (positiveFactors.length > 0) {
    summary += `${positiveFactors[0]} ו${positiveFactors[1] || 'התנאים בסיסיים נוחים'}. `;
  }
  
  if (negativeFactors.length > 0) {
    summary += `עם זאת, ${negativeFactors[0]} ולכן ${bestTime.includes('מוקדם') ? 'מומלץ להגיע מוקדם' : 'כדאי לתכנן בהתאם'}.`;
  }

  return {
    score,
    status,
    headline,
    shortExplanation,
    bestTimeWindow: bestTime,
    suitableFor: getSuitableActivities(waveHeight, windSpeed),
    notIdealFor: getNotIdealActivities(waveHeight, windSpeed),
    riskFlags: [...riskFlags, ...(template.caution || [])],
    positiveFactors,
    negativeFactors,
    explanationSummary: summary
  };
}

/**
 * Heuristic to determine the best time window based on activity and current forecast.
 */
function getBestTimeWindow(activity: ActivityId, temperature: number): string {
  // In a real app, this would use hourly data. 
  // For V0, we provide general advice based on typical Israeli patterns.
  if (activity === 'surf' || activity === 'sup' || activity === 'swim') {
    return '06:00 - 10:00 (הכי רגוע)';
  }
  if (activity === 'beach' || activity === 'kids') {
    if (temperature > 28) return '07:00 - 11:00 או אחרי 16:00';
    return '10:00 - 15:00';
  }
  return 'כל היום';
}

function getSuitableActivities(waveHeight: number, windSpeed: number): ActivityId[] {
  const activities: ActivityId[] = ['beach', 'swim', 'kids', 'surf', 'sup', 'sail'];
  return activities.filter(id => {
    // Simple filter: if wave or wind is too high, most aren't suitable
    if (waveHeight > 1.2 && id !== 'surf') return false;
    if (windSpeed > 25 && (id === 'sup' || id === 'kids')) return false;
    return true;
  });
}

function getNotIdealActivities(waveHeight: number, windSpeed: number): ActivityId[] {
  const notIdeal: ActivityId[] = [];
  if (waveHeight < 0.3) notIdeal.push('surf');
  if (waveHeight > 0.8) notIdeal.push('kids', 'swim');
  if (windSpeed > 20) notIdeal.push('sup', 'beach');
  return notIdeal;
}

