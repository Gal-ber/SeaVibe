/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Beach, Activity } from '../types';
import { createHourlyForecast, getMockWindAnalysis } from './mockForecasts';

export const ACTIVITIES: Activity[] = [
  { id: 'beach', label: 'ישיבה בחוף', icon: 'Sun' },
  { id: 'swim', label: 'שחייה', icon: 'Waves' },
  { id: 'kids', label: 'ילדים', icon: 'Baby' },
  { id: 'surf', label: 'גלישה', icon: 'Zap' },
  { id: 'sup', label: 'SUP / קיאק', icon: 'Anchor' },
  { id: 'sail', label: 'שייט קצר', icon: 'Ship' },
];

export const BEACHES: Beach[] = [
  {
    id: 'gordon',
    name: 'חוף גורדון',
    city: 'תל אביב',
    lat: 32.0833,
    lng: 34.7663,
    forecast: {
      waveHeight: 0.3,
      wavePeriod: 5,
      windSpeed: 12,
      windDirection: 'מערבית',
      temperature: 26,
      waterTemp: 22,
      uvIndex: 7,
      precipitationChance: 0,
      source: 'mock',
      hourlyForecast: createHourlyForecast(0.3, 12, 26),
      windAnalysis: getMockWindAnalysis(12, 'stronger')
    },
  },
  {
    id: 'herzliya',
    name: 'מרינה הרצליה',
    city: 'הרצליה',
    lat: 32.1620,
    lng: 34.7950,
    forecast: {
      waveHeight: 0.2,
      wavePeriod: 4,
      windSpeed: 10,
      windDirection: 'צפון-מערבית',
      temperature: 25,
      waterTemp: 22,
      uvIndex: 6,
      precipitationChance: 5,
      source: 'mock',
      hourlyForecast: createHourlyForecast(0.2, 10, 25),
      windAnalysis: getMockWindAnalysis(10, 'stable')
    },
  },
  {
    id: 'palmachim',
    name: 'פלמחים',
    city: 'גן לאומי פלמחים',
    lat: 31.9284,
    lng: 34.7431,
    forecast: {
      waveHeight: 0.4,
      wavePeriod: 6,
      windSpeed: 8,
      windDirection: 'מערבית',
      temperature: 24,
      waterTemp: 21,
      uvIndex: 5,
      precipitationChance: 0,
      source: 'mock',
      hourlyForecast: createHourlyForecast(0.4, 8, 24),
      windAnalysis: getMockWindAnalysis(8, 'stable')
    },
  },
  {
    id: 'netanya',
    name: 'נתניה',
    city: 'נתניה מרכז',
    lat: 32.3275,
    lng: 34.8519,
    forecast: {
      waveHeight: 0.8,
      wavePeriod: 8,
      windSpeed: 22,
      windDirection: 'דרום-מערבית',
      temperature: 23,
      waterTemp: 21,
      uvIndex: 6,
      precipitationChance: 10,
      source: 'mock',
      hourlyForecast: createHourlyForecast(0.8, 22, 23),
      windAnalysis: getMockWindAnalysis(22, 'stronger')
    },
  },
  {
    id: 'haifa',
    name: 'חיפה',
    city: 'חוף הכרמל',
    lat: 32.8122,
    lng: 34.9546,
    forecast: {
      waveHeight: 0.5,
      wavePeriod: 5,
      windSpeed: 15,
      windDirection: 'מערבית',
      temperature: 24,
      waterTemp: 21,
      uvIndex: 7,
      precipitationChance: 0,
      source: 'mock',
      hourlyForecast: createHourlyForecast(0.5, 15, 24),
      windAnalysis: getMockWindAnalysis(15, 'stable')
    },
  },
  {
    id: 'ashdod',
    name: 'אשדוד',
    city: 'אשדוד',
    lat: 31.7946,
    lng: 34.6293,
    forecast: {
      waveHeight: 0.4,
      wavePeriod: 6,
      windSpeed: 14,
      windDirection: 'מערבית',
      temperature: 25,
      waterTemp: 22,
      uvIndex: 6,
      precipitationChance: 0,
      source: 'mock',
      hourlyForecast: createHourlyForecast(0.4, 14, 25),
      windAnalysis: getMockWindAnalysis(14, 'stronger')
    },
  },
  {
    id: 'eilat',
    name: 'אילת',
    city: 'החוף הצפוני',
    lat: 29.5492,
    lng: 34.9608,
    forecast: {
      waveHeight: 0.0,
      wavePeriod: 2,
      windSpeed: 5,
      windDirection: 'צפונית',
      temperature: 32,
      waterTemp: 23,
      uvIndex: 9,
      precipitationChance: 0,
      source: 'mock',
      hourlyForecast: createHourlyForecast(0.0, 5, 32),
      windAnalysis: getMockWindAnalysis(5, 'stable')
    },
  },
];
