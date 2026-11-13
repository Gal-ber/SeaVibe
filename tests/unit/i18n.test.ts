// בדיקות לשפות ולחיפוש: תרגום, אנגלית במנוע, וחיפוש חוף בשתי השפות בלי תלות בניקוד וגרשיים.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { translate } from '../../src/i18n/translate';
import { normalizeSearch, searchBeaches } from '../../src/data/beaches';
import { normalizeForecastFile } from '../../src/engine/normalize';
import { buildBeachForecast } from '../../src/engine/forecastView';
import { getRecommendation } from '../../src/engine/recommend';
import { formatValue } from '../../src/lib/formatValue';

describe('translate', () => {
  it('מחליף משתנים בטקסט', () => {
    expect(translate('en', 'hero.vibe', { activity: 'Surfing', score: 74 })).toBe('Surfing vibe: 74/100');
    expect(translate('he', 'reports.count', { n: 3 })).toBe('3 דיווחים');
  });
  it('יחידות לפי שפה', () => {
    expect(formatValue('windSpeed', 12, 'en')).toBe('12 km/h');
    expect(formatValue('windSpeed', 12, 'he')).toBe('12 קמ״ש');
    expect(formatValue('waveHeight', null, 'en')).toBe('Not available');
  });
});

describe('חיפוש חוף (FR-4)', () => {
  const ids = (q: string) => searchBeaches(q).map((b) => b.id);
  it('מוצא בעברית ובאנגלית', () => {
    expect(ids('פלמחים')).toEqual(['palmachim']);
    expect(ids('Palmachim')).toEqual(['palmachim']);
    expect(ids('palm')).toEqual(['palmachim']);
  });
  it('לא תלוי בניקוד, גרשיים ומקפים', () => {
    expect(normalizeSearch('פַּלְמַחִים')).toBe('פלמחים');
    expect(ids('פַּלְמַחִים')).toEqual(['palmachim']);
    expect(ids('ת"א')).toEqual([]);
    expect(ids('tel-aviv')).toEqual(['gordon']);
  });
  it('אין תוצאה: לא ממציא חוף', () => {
    expect(ids('ניו יורק')).toEqual([]);
  });
});

describe('ההמלצה באנגלית', () => {
  it('הכותרת וההסבר באנגלית, בלי אותיות עבריות', () => {
    const data = normalizeForecastFile(JSON.parse(readFileSync('public/data/forecast.json', 'utf8')))!;
    const gordon = buildBeachForecast(data.series.gordon, 'mock', new Date('2026-07-01T05:30:00Z'));
    const rec = getRecommendation(gordon, 'surf', 'en')!;
    const all = [rec.headline, rec.shortExplanation, rec.explanationSummary, ...rec.positiveFactors, ...rec.negativeFactors].join(' ');
    expect(all).not.toMatch(/[֐-׿]/);
    expect(rec.negativeFactors[0]).toContain('Waves are too low');
  });
});
