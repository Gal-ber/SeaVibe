// בדיקה שכותרות האבטחה של Cloudflare Pages קיימות (public/_headers), ושאתר הבדיקה לא נכנס למנועי חיפוש.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const headers = readFileSync('public/_headers', 'utf8');

describe('כותרות אבטחה', () => {
  it.each([
    "X-Frame-Options: DENY",
    "Content-Security-Policy: frame-ancestors 'none'",
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy: geolocation=(self)',
  ])('%s', (line) => expect(headers).toContain(line));

  it('אתר הבדיקה מסומן noindex', () => {
    expect(headers).toMatch(/preview\.sea-vibes\.pages\.dev\/\*\n\s+X-Robots-Tag: noindex/);
  });
});
