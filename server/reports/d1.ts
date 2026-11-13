// הגדרה מינימלית של מסד D1 של Cloudflare: רק מה שהשרת שלנו משתמש בו.
// כך אפשר להריץ את אותו קוד גם מול SQLite מקומי בבדיקות (tests/helpers/d1-shim.ts).
export interface D1Result<T> {
  results: T[];
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}
