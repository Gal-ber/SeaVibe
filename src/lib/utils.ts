/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates the distance between two points in km using the Haversine formula
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

import { Beach, BackgroundState } from '../types';

export function getBackgroundState(beach: Beach): BackgroundState {
  const hour = new Date().getHours();
  const { waveHeight, windSpeed, precipitationChance } = beach.forecast;

  // Night
  if (hour < 6 || hour > 19) return 'night_calm';
  
  // Sunset mood
  if (hour >= 18 && hour <= 19) return 'sunset_sea';

  // Weather conditions
  if (precipitationChance !== null && precipitationChance > 20) return 'calm_cloudy_day';

  // Sea conditions (נתון חסר לא משנה את הרקע)
  if (waveHeight !== null && waveHeight > 1.2) return 'rough_sea_day';
  if (waveHeight !== null && waveHeight > 0.6) return 'wavy_sunny_day';
  if (windSpeed !== null && windSpeed > 25) return 'windy_day';

  // Default
  return 'calm_sunny_day';
}
