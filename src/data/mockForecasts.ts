/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HourlyForecast, WindAnalysis, WindTrend } from '../types';

export const createHourlyForecast = (baseWave: number, baseWind: number, baseTemp: number): HourlyForecast[] => {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  return hours.map((time, i) => {
    const hourInt = parseInt(time.split(':')[0]);
    const windMultiplier = hourInt > 12 ? 1.5 : 1.0;
    const waveMultiplier = hourInt > 13 ? 1.2 : 1.0;
    
    return {
      time,
      airTemperature: baseTemp + (hourInt > 12 ? 2 : 0),
      waterTemperature: 22 + (hourInt > 14 ? 1 : 0),
      windSpeed: Math.round(baseWind * windMultiplier),
      windDirection: hourInt > 14 ? 'צפון-מערבית' : 'מערבית',
      waveHeight: parseFloat((baseWave * waveMultiplier).toFixed(1)),
      wavePeriod: 5,
      uvIndex: hourInt > 11 && hourInt < 15 ? 9 : 4,
      precipitationChance: 0,
    };
  });
};

export const getMockWindAnalysis = (baseSpeed: number, trend: WindTrend): WindAnalysis => {
  const explanations: Record<WindTrend, string> = {
    stable: 'הרוח צפויה להישאר יציבה לאורך כל היום. תנאים נוחים לפעילות ממושכת.',
    stronger: 'הרוח רגועה בבוקר, אבל מתחילה להרים ראש בצהריים. אם אתם בעניין של SUP — עדיף להגיע מוקדם.',
    weaker: 'הרוח חזקה כרגע אך צפויה להירגע לקראת שעות אחר הצהריים.',
    shifting: 'כיוון הרוח צפוי להשתנות משמעותית בשעות הקרובות, מה שעשוי להשפיע על מצב הים.'
  };

  return {
    speed: baseSpeed,
    direction: 'מערבית',
    trend,
    changeTime: '13:00',
    impact: trend === 'stronger' ? 'מוריד נוחות ל-SUP ושחייה בצהריים' : 'תנאים משתפרים',
    explanation: explanations[trend]
  };
};
