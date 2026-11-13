// דיווחי השטח של המשתמש, שמורים במכשיר בלבד (FR-11). אין מיקום, אין טקסט חופשי, אין פרטים אישיים.
// דיווח אחד לכל חוף ופעילות בחלון של 4 שעות: דיווח חדש מחליף את הקודם (אפשר לשנות הצבעה).
// מתי נוגעים: שלב 4 (שמירה בשרת). עד אז הכול מקומי.
import { useCallback, useEffect, useState } from 'react';
import { ActivityId, FieldReport } from '../types';
import { REPORT_WINDOW_HOURS } from './fieldReports';

const KEY = 'seavibes_reports';
const fresh = (r: FieldReport) => Date.now() - new Date(r.createdAt).getTime() < REPORT_WINDOW_HOURS * 3600_000;

function load(): FieldReport[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(fresh) : [];
  } catch {
    return [];
  }
}

export function useFieldReports() {
  const [reports, setReports] = useState<FieldReport[]>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(reports.filter(fresh))); } catch { /* אחסון לא זמין */ }
  }, [reports]);

  const submit = useCallback((beachId: string, activity: ActivityId, isAccurate: boolean, reason?: string) => {
    const report: FieldReport = { id: crypto.randomUUID(), beachId, activity, isAccurate, reason, createdAt: new Date().toISOString() };
    setReports((prev) => [report, ...prev.filter((r) => !(r.beachId === beachId && r.activity === activity))]);
  }, []);

  return { reports, submit };
}
