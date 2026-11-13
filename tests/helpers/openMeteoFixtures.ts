// תשובות דוגמה בפורמט של Open-Meteo (לפי התיעוד הרשמי), לבדיקות בלי אינטרנט.
// מערך של 7 מיקומים, 48 שעות לפי שעון ישראל, עם כמה ערכים חסרים כמו שקורה במציאות.
// המשיכה החיה הראשונה תאמת שהפורמט האמיתי זהה.

const hoursFrom = (date: string) =>
  Array.from({ length: 48 }, (_, i) => {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCHours(i);
    return d.toISOString().slice(0, 13) + ':00';
  });

export function weatherResponse(date: string, locations = 7) {
  const time = hoursFrom(date);
  return Array.from({ length: locations }, (_, loc) => ({
    latitude: 32 + loc * 0.1,
    longitude: 34.8,
    utc_offset_seconds: 7200,
    timezone: 'Asia/Jerusalem',
    hourly_units: { time: 'iso8601', temperature_2m: '°C', wind_speed_10m: 'km/h', wind_direction_10m: '°', precipitation_probability: '%', uv_index: '' },
    hourly: {
      time,
      temperature_2m: time.map((_, h) => 20 + (h % 24 > 10 && h % 24 < 17 ? 5 : 0) + loc * 0.1),
      wind_speed_10m: time.map((_, h) => 8 + (h % 24) / 2),
      wind_direction_10m: time.map(() => 280),
      precipitation_probability: time.map(() => 0),
      uv_index: time.map((_, h) => (h % 24 >= 7 && h % 24 <= 17 ? 5 : 0)),
    },
  }));
}

export function marineResponse(date: string, locations = 7) {
  const time = hoursFrom(date);
  return Array.from({ length: locations }, (_, loc) => ({
    latitude: 32 + loc * 0.1,
    longitude: 34.7,
    utc_offset_seconds: 7200,
    timezone: 'Asia/Jerusalem',
    hourly_units: { time: 'iso8601', wave_height: 'm', wave_period: 's', sea_surface_temperature: '°C' },
    hourly: {
      time,
      wave_height: time.map((_, h) => (loc === 6 && h < 3 ? null : 0.3 + (h % 24) * 0.02)),
      wave_period: time.map(() => 5),
      sea_surface_temperature: time.map(() => 23.4),
    },
  }));
}
