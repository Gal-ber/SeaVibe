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
  speed: number | null;
  direction: string | null;
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

// שורה אחת בטבלה השעתית. null = נתון חסר ("לא זמין"), לעולם לא 0.
export interface HourlyForecast {
  time: string;
  airTemperature: number | null;
  waterTemperature: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  waveHeight: number | null;
  wavePeriod: number | null;
  uvIndex: number | null;
  precipitationChance: number | null;
}

// התחזית של חוף: הערכים של השעה הנוכחית, יחד עם כל הסדרה השעתית שממנה נלקחו.
export interface BeachForecast {
  currentTime: string | null;
  waveHeight: number | null;
  wavePeriod: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  temperature: number | null;
  waterTemp: number | null;
  uvIndex: number | null;
  precipitationChance: number | null;
  source: 'mock' | 'live';
  fetchedAt: string | null;
  hourlyForecast: HourlyForecast[];
  windAnalysis: WindAnalysis | null;
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

// חוף מהקטלוג (config/beaches.json), בלי תחזית.
export interface BeachInfo {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  cityEn: string;
  lat: number;
  lng: number;
}

// חוף יחד עם התחזית שלו, כמו שהמסכים מקבלים אותו.
export interface Beach extends BeachInfo {
  forecast: BeachForecast;
  isFavorite?: boolean;
}

export type ScoreStatus = 'excellent' | 'good' | 'fair' | 'poor';

// ההמלצה לחוף ופעילות בשעה הנוכחית. כל גורם בהסבר נובע מכלל שהופעל בפועל במנוע.
export interface BeachRecommendation {
  score: number;
  status: ScoreStatus;
  headline: string;
  shortExplanation: string;
  bestTimeWindow: string | null;
  positiveFactors: string[];
  negativeFactors: string[];
  explanationSummary: string;
  confidence: 'full' | 'partial';
  scoringVersion: string;
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
