// כל אייקון שמוזכר בשם (בקוד או בקטלוג הפעילויות) קיים ברשימת האייקונים הקטנה. אחרת המסך היה נופל.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Icons } from '../../src/components/icons';
import { ACTIVITIES } from '../../src/data/beaches';

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? files(join(dir, n)) : [join(dir, n)]));

describe('אייקונים', () => {
  it('כל אייקון של פעילות קיים', () => {
    for (const a of ACTIVITIES) expect(Icons, a.icon).toHaveProperty(a.icon);
  });
  it('כל אייקון שמוזכר בשם בקבצי הרכיבים קיים', () => {
    const names = files('src')
      .filter((f) => f.endsWith('.tsx'))
      .flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/icon(?:=|: )["']([A-Z][A-Za-z0-9]+)["']/g)].map((m) => m[1]));
    expect(names.length).toBeGreaterThan(5);
    for (const n of names) expect(Icons, n).toHaveProperty(n);
  });
});
