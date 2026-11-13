// מדמה את מסד D1 של Cloudflare מעל SQLite המובנה ב-Node, לבדיקות על המחשב בלבד.
// כך בודקים את קוד השרת האמיתי בלי חשבון ובלי אינטרנט.
import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import type { D1Database, D1PreparedStatement } from '../../server/reports/d1';

export function createTestD1(): D1Database & { raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  for (const file of readdirSync('migrations').filter((f) => f.endsWith('.sql')).sort()) {
    raw.exec(readFileSync(`migrations/${file}`, 'utf8'));
  }
  const prepare = (query: string, values: unknown[] = []): D1PreparedStatement => ({
    bind: (...v: unknown[]) => prepare(query, v),
    all: async <T>() => ({ results: raw.prepare(query).all(...(values as never[])) as T[] }),
    first: async <T>() => (raw.prepare(query).get(...(values as never[])) as T) ?? null,
    run: async () => raw.prepare(query).run(...(values as never[])),
  });
  return {
    raw,
    prepare: (q: string) => prepare(q),
    batch: async (statements) => Promise.all(statements.map((s) => s.run())),
  };
}
