/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HourlyForecast, SelectedParameter, ActivityId } from '../types';

export function generateHourlyInsight(
  selectedParameter: SelectedParameter,
  hourlyForecast: HourlyForecast[],
  selectedActivity?: ActivityId
): string {
  if (!hourlyForecast || hourlyForecast.length < 2) {
    return "תובנה מהירה: התנאים די יציבים לאורך היום, אז כדאי לבחור את השעה לפי הנוחות שלך והפעילות שתכננת.";
  }

  const first = hourlyForecast[0];
  const last = hourlyForecast[hourlyForecast.length - 1];
  const mid = hourlyForecast[Math.floor(hourlyForecast.length / 2)];

  // Helper to determine trend
  const getTrend = (key: keyof HourlyForecast) => {
    const valStart = first[key] as number;
    const valEnd = last[key] as number;
    const diff = valEnd - valStart;
    
    if (Math.abs(diff) < (key === 'waveHeight' ? 0.1 : 2)) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  };

  const waveTrend = getTrend('waveHeight');
  const windTrend = getTrend('windSpeed');
  const tempTrend = getTrend('airTemperature');

  // Logic based on selected parameter
  if (selectedParameter === 'waveHeight') {
    if (selectedActivity === 'surf' || selectedActivity === 'sail') {
        if (waveTrend === 'increasing') return "הגלים עולים בהדרגה לקראת הצהריים, מה שיכול לשפר את התנאים לגלישה — כדאי לכוון לשעות המאוחרות יותר.";
        if (waveTrend === 'decreasing') return "הים נרגע לאורך היום. לגולשים עדיף לנצל את השעות המוקדמות לפני שהגובה יורד.";
    }
    
    if (waveTrend === 'increasing') return "הגלים עולים בהדרגה לקראת הצהריים, אז אם חיפשת קצת יותר תנועה במים — עדיף לכוון לשעות המאוחרות של הבוקר.";
    if (waveTrend === 'decreasing') return "הים נרגע בהמשך היום, אז לשחייה רגועה או ילדים עדיף לשקול את השעות המאוחרות יותר.";
    return "גובה הגלים די יציב לאורך היום, אז ההחלטה תלויה יותר ברוח ובפעילות שתכננת.";
  }

  if (selectedParameter === 'wind') {
    if (selectedActivity === 'sup' || selectedActivity === 'swim' || selectedActivity === 'kids') {
        if (windTrend === 'increasing') return "הרוח מתחזקת בהמשך היום, אז ל-SUP או שחייה עם ילדים עדיף להגיע מוקדם כשהים רגוע ושקט.";
    }
    
    if (windTrend === 'increasing') return "הרוח רגועה בבוקר אבל מתחזקת בהמשך, לכן SUP ושחייה עם ילדים יתאימו יותר לשעות המוקדמות.";
    if (windTrend === 'decreasing') return "הרוח נחלשת בהמשך היום, אז ייתכן שהשעות המאוחרות יהיו נוחות יותר לפעילות רגועה במים.";
    
    // Direction change check
    if (first.windDirection !== last.windDirection) {
        return "כיוון הרוח משתנה לאורך היום, אז כדאי לבדוק את השעה המדויקת לפני גלישה או שייט.";
    }
    
    return "הרוח נשארת די יציבה לאורך היום, אז כדאי לבחור שעה לפי גובה הגלים והטמפרטורה.";
  }

  if (selectedParameter === 'airTemperature') {
    if (tempTrend === 'increasing' && last.airTemperature > 28) {
        return "הטמפרטורה עולה לקראת הצהריים ויהיה חם, אז לישיבה נעימה בחוף עדיף להגיע לפני שיא החום.";
    }
    if (tempTrend === 'increasing') return "הטמפרטורה עולה בהדרגה ויהיה נעים יותר בצהריים, מתאים בדיוק למי שאוהב שמש.";
    if (tempTrend === 'stable') return "הטמפרטורה נוחה ודי יציבה לאורך היום, כך שאפשר לבחור שעה לפי הרוח והגלים.";
    return "חם במיוחד בצהריים, אז עדיף לכוון לשעות הבוקר או אחר הצהריים ולבוא מוכנים עם מים וצל.";
  }

  if (selectedParameter === 'waterTemperature') {
    return "טמפרטורת המים יציבה לאורך היום, אז ההחלטה תלויה בעיקר ברוח, בגלים ובשעה שנוחה לך.";
  }

  // Fallback
  return "תובנה מהירה: התנאים די יציבים לאורך היום, אז כדאי לבחור את השעה לפי הנוחות שלך והפעילות שתכננת.";
}
