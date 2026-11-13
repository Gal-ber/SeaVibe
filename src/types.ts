/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActivityId = 'beach' | 'swim' | 'kids' | 'surf' | 'sup' | 'sail';

export interface Activity {
  id: ActivityId;
  label: string;
  icon: string;
}

export type WindTrend = 'stable' | 'stronger' | 'weaker' | 'shifting';

export interface WindAnalysis {
  speed: number;
  direction: string;
  trend: WindTrend;
  changeTime?: string;
  impact: string;
  explanation: string;
}

export type SelectedParameter =
  | "airTemperature"
  | "waterTemperature"
  | "wind"
  | "waveHeight";

export interface HourlyForecast {
  time: string;
  airTemperature: number;
  waterTemperature: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  wavePeriod?: number;
  uvIndex?: number;
  precipitationChance?: number;
}

export interface BeachForecast {
  waveHeight: number; 
  wavePeriod: number; 
  windSpeed: number; 
  windDirection: string | number;
  temperature: number; 
  waterTemp: number;
  uvIndex: number;
  precipitationChance: number;
  source?: "open-meteo" | "mock";
  fetchedAt?: string;
  hourlyForecast?: HourlyForecast[];
  windAnalysis?: WindAnalysis;
}

export type BackgroundState =
  | 'calm_sunny_day'
  | 'wavy_sunny_day'
  | 'calm_cloudy_day'
  | 'sunset_sea'
  | 'night_calm'
  | 'windy_day'
  | 'rough_sea_day';

export interface UserSettings {
  onboardingCompleted: boolean;
  favorites: string[]; // Beach IDs
  primaryFavorite?: string;
  favoriteActivities: ActivityId[];
  locationPermissionGranted: boolean;
}

export interface Beach {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  forecast: BeachForecast;
  isFavorite?: boolean;
}

export interface BeachRecommendation {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  headline: string;
  shortExplanation: string;
  bestTimeWindow: string;
  suitableFor: ActivityId[];
  notIdealFor: ActivityId[];
  riskFlags: string[];
  positiveFactors: string[];
  negativeFactors: string[];
  explanationSummary: string;
}

export interface FieldReport {
  id: string;
  beachId: string;
  activity: ActivityId;
  isAccurate: boolean;
  reason?: string;
  createdAt: string;
}

export interface FieldReportSummary {
  totalReports: number;
  positiveReports: number;
  negativeReports: number;
  positivePercentage: number;
  topReasons: string[];
  summaryText: string;
}
