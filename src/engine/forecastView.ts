// הופך את הסדרה השעתית של חוף לתחזית שהמסכים מציגים.
// הכרטיס מקבל את השורה של השעה הנוכחית (שעון ישראל), והטבלה מקבלת את כל הסדרה.
// כך יש מקור אחד לכל המספרים, וכרטיס וטבלה תמיד מראים אותו דבר.
// גם מגמת הרוח מחושבת כאן מהנתונים עצמם, לא נכתבת ידנית.
// מתי נוגעים: כשמשנים איך בוחרים "עכשיו" או איך מחשבים מגמת רוח.
import { HourRow } from './dataContract';
import { BeachForecast, HourlyForecast, WindAnalysis, WindTrend } from '../types';

// כיוון הרוח נשמר כמפתח (N, NE...). המסך מתרגם אותו (compass.N וכו׳ בקובצי הטקסטים).
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function degreesToCompass(deg: number | null): string | null {
  if (deg === null) return null;
  return COMPASS[Math.round(deg / 45) % 8];
}

// התאריך הנוכחי בשעון ישראל, למשל "2026-11-13"
export function israelDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

// השעה העגולה הנוכחית בשעון ישראל, למשל "14:00"
export function israelHour(now: Date): string {
  const hour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', hourCycle: 'h23' }).format(now);
  return `${hour.padStart(2, '0')}:00`;
}

export function toHourly(row: HourRow): HourlyForecast {
  const f = row.fields;
  return {
    time: row.localTime,
    airTemperature: f.airTemperature.value,
    waterTemperature: f.waterTemperature.value,
    windSpeed: f.windSpeed.value,
    windDirection: degreesToCompass(f.windDirection.value),
    waveHeight: f.waveHeight.value,
    wavePeriod: f.wavePeriod.value,
    uvIndex: f.uvIndex.value,
    precipitationChance: f.precipitationChance.value,
  };
}

const WIND_STEP = 5; // שינוי של 5 קמ״ש ומעלה נחשב שינוי מגמה

export function deriveWindAnalysis(hours: HourlyForecast[], currentIndex: number): WindAnalysis | null {
  const current = hours[currentIndex];
  if (!current || current.windSpeed === null) return null;
  const speed = current.windSpeed;
  const later = hours.slice(currentIndex + 1);

  let trend: WindTrend = 'stable';
  let changeTime: string | undefined;
  const stronger = later.find((h) => h.windSpeed !== null && h.windSpeed >= speed + WIND_STEP);
  const weaker = later.find((h) => h.windSpeed !== null && h.windSpeed <= speed - WIND_STEP);
  const shifted = later.find((h) => h.windDirection !== null && current.windDirection !== null && h.windDirection !== current.windDirection);
  if (stronger) [trend, changeTime] = ['stronger', stronger.time];
  else if (weaker) [trend, changeTime] = ['weaker', weaker.time];
  else if (shifted) [trend, changeTime] = ['shifting', shifted.time];

  return { speed, direction: current.windDirection, trend, changeTime, impact: '', explanation: '' };
}

export function emptyForecast(source: 'mock' | 'live'): BeachForecast {
  return {
    currentTime: null, waveHeight: null, wavePeriod: null, windSpeed: null, windDirection: null,
    temperature: null, waterTemp: null, uvIndex: null, precipitationChance: null,
    source, fetchedAt: null, hourlyForecast: [], windAnalysis: null,
  };
}

export function buildBeachForecast(allRows: HourRow[] | undefined, source: 'mock' | 'live', now: Date): BeachForecast {
  // נתוני אמת מכסים כמה ימים: לוקחים רק את השעות של היום (שעון ישראל). נתוני דוגמה הם "יום טיפוסי" בלי תאריך.
  const today = israelDate(now);
  const rows = allRows?.some((r) => r.validAt) ? allRows.filter((r) => r.validAt?.slice(0, 10) === today) : allRows;
  if (!rows || rows.length === 0) return emptyForecast(source);
  const hourly = rows.map(toHourly);
  const index = hourly.findIndex((h) => h.time === israelHour(now));
  if (index === -1) return { ...emptyForecast(source), hourlyForecast: hourly };
  const now_ = hourly[index];
  return {
    currentTime: now_.time,
    waveHeight: now_.waveHeight,
    wavePeriod: now_.wavePeriod,
    windSpeed: now_.windSpeed,
    windDirection: now_.windDirection,
    temperature: now_.airTemperature,
    waterTemp: now_.waterTemperature,
    uvIndex: now_.uvIndex,
    precipitationChance: now_.precipitationChance,
    source,
    fetchedAt: rows[index].fields.windSpeed.fetchedAt,
    hourlyForecast: hourly,
    windAnalysis: deriveWindAnalysis(hourly, index),
  };
}
