// מייצר את קובץ נתוני הדוגמה public/data/forecast.json מתוך data-sources/mock/profiles.json.
// אותם פרופילים תמיד נותנים בדיוק אותם מספרים (אין אקראיות), כדי שהבדיקות יהיו יציבות.
// מתי נוגעים: כשמשנים את צורת יום הדוגמה. אחרי שינוי בפרופילים מריצים: npm run mock:generate
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const UNITS = {
  airTemperature: '°C',
  waterTemperature: '°C',
  windSpeed: 'km/h',
  windDirection: 'deg',
  waveHeight: 'm',
  wavePeriod: 's',
  uvIndex: 'index',
  precipitationChance: '%',
};

const round1 = (n) => Math.round(n * 10) / 10;

// כמה הרוח חזקה בשעה מסוימת, ביחס לערך הבסיס (בריזת ים: חזקה יותר אחר הצהריים)
function windFactor(trend, hour) {
  const breeze = 0.8 + 0.2 * Math.cos(((hour - 15) / 24) * 2 * Math.PI);
  if (trend === 'stronger') return breeze * (hour >= 12 ? 1.5 : 1);
  if (trend === 'weaker') return breeze * (hour >= 13 ? 0.6 : 1);
  return breeze;
}

function hourValues(p, hour) {
  const daylight = hour >= 6 && hour <= 19 ? Math.sin((Math.PI * (hour - 6)) / 13) : 0;
  const shiftedDir = p.windTrend === 'stronger' && hour >= 15 ? p.windDirection + 30 : p.windDirection;
  return {
    airTemperature: round1(p.airMax - 2 + 2 * Math.cos(((hour - 14) / 24) * 2 * Math.PI)),
    waterTemperature: p.waterTemp === null ? null : round1(p.waterTemp + (hour >= 14 && hour <= 18 ? 0.5 : 0)),
    windSpeed: Math.round(p.windSpeed * windFactor(p.windTrend, hour)),
    windDirection: shiftedDir % 360,
    waveHeight: round1(p.waveHeight * (p.windTrend === 'stronger' && hour >= 13 ? 1.25 : 1)),
    wavePeriod: p.wavePeriod,
    uvIndex: Math.max(0, Math.round(p.uvMax * daylight)),
    precipitationChance: p.precipitationChance,
  };
}

export function generateMockForecast(profiles) {
  return {
    schemaVersion: 1,
    dataMode: 'mock',
    timezone: 'Asia/Jerusalem',
    generatedAt: null,
    beaches: profiles.map((p) => ({
      beachId: p.beachId,
      hours: Array.from({ length: 24 }, (_, hour) => {
        const values = hourValues(p, hour);
        const fields = {};
        for (const [name, value] of Object.entries(values)) {
          fields[name] = { value, unit: UNITS[name], source: 'mock', fetchedAt: null };
        }
        return { localTime: `${String(hour).padStart(2, '0')}:00`, validAt: null, fields };
      }),
    })),
  };
}

export function readProfiles() {
  const url = new URL('../data-sources/mock/profiles.json', import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')).profiles;
}

// הרצה ישירה: node scripts/generate-mock.mjs
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = new URL('../public/data/forecast.json', import.meta.url);
  writeFileSync(out, JSON.stringify(generateMockForecast(readProfiles()), null, 1) + '\n');
  console.log('✔ נוצר public/data/forecast.json');
}
