// בדיקה מקצה לקצה של מצב remote, בלי אינטרנט: האתר שולח ל-/api/reports,
// ו"הרשת" המדומה מעבירה את הבקשה לקוד השרת האמיתי מול SQLite מקומי.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestD1 } from '../helpers/d1-shim';
import { handleReportsRequest } from '../../server/reports/handler';

vi.mock('../../config/app.config.json', () => ({ default: { dataMode: 'mock', reportsMode: 'remote' } }));

const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
});

const ORIGIN = 'https://seavibes.example';
const env = { DB: createTestD1(), REPORTER_SALT: 'test-salt-0123456789abcdef' };
const calls: string[] = [];
vi.stubGlobal('fetch', async (input: string, init?: RequestInit) => {
  calls.push(`${init?.method ?? 'GET'} ${input}`);
  return handleReportsRequest(new Request(new URL(input, ORIGIN), init), env, Date.now());
});

const { loadCounts, submitReport, getMyVote, reportsMode } = await import('../../src/engine/reportsStore');

describe('דיווחים במצב remote', () => {
  beforeEach(() => storage.clear());

  it('המצב נקרא מקובץ ההגדרות', () => expect(reportsMode()).toBe('remote'));

  it('שליחה לשרת, ספירה מהשרת, וההצבעה נשמרת גם במכשיר', async () => {
    expect(await submitReport('haifa', 'surf', true, 'reason.goodWaves')).toBe('saved');
    expect(await loadCounts('haifa', 'surf')).toEqual({ total: 1, positive: 0, topReasons: [] });
    expect(getMyVote('haifa', 'surf')?.isAccurate).toBe(true);
    expect(calls.every((c) => c.includes(' /api/reports'))).toBe(true);
  });

  it('השרת דוחה סיבה שלא ברשימה, וההצבעה לא נשמרת במכשיר', async () => {
    expect(await submitReport('haifa', 'kids', true, 'טקסט חופשי')).toBe('error');
    expect(getMyVote('haifa', 'kids')).toBeNull();
  });

  it('המזהה האנונימי נוצר פעם אחת ונשמר במכשיר', async () => {
    await submitReport('eilat', 'sup', true, null);
    const first = storage.get('seavibes_reporter_id');
    await submitReport('eilat', 'sail', false, null);
    expect(storage.get('seavibes_reporter_id')).toBe(first);
  });
});
