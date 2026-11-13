/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BeachForecast } from '../types';

export async function fetchBeachForecast(lat: number, lng: number): Promise<BeachForecast> {
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period,wave_direction`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,uv_index`;

  try {
    const [marineRes, weatherRes] = await Promise.all([
      fetch(marineUrl),
      fetch(weatherUrl)
    ]);

    if (!marineRes.ok || !weatherRes.ok) {
      throw new Error('Failed to fetch from Open-Meteo');
    }

    const marineData = await marineRes.json();
    const weatherData = await weatherRes.json();

    const currentMarine = marineData.current;
    const currentWeather = weatherData.current;

    return {
      waveHeight: currentMarine?.wave_height ?? 0,
      wavePeriod: currentMarine?.wave_period ?? 0,
      windSpeed: currentWeather?.wind_speed_10m ?? 0,
      windDirection: degToCompass(currentWeather?.wind_direction_10m),
      temperature: Math.round(currentWeather?.temperature_2m ?? 0),
      waterTemp: 22, // Marine API often doesn't give surface water temp in current, fallback to static
      uvIndex: currentWeather?.uv_index ?? 0,
      precipitationChance: currentWeather?.precipitation_probability ?? 0,
      source: 'open-meteo',
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Weather Service Error:', error);
    throw error;
  }
}

function degToCompass(num: number | undefined): string {
  if (num === undefined) return 'לא ידוע';
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["צפונית", "צפון-מזרחית", "מזרחית", "דרום-מזרחית", "דרומית", "דרום-מערבית", "מערבית", "צפון-מערבית"];
  return arr[(val % 8)];
}
