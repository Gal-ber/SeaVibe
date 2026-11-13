// דיווחי שטח (FR-10): הפיכת המספרים לטקסט סיכום.
// 0 דיווחים: "עדיין אין מספיק דיווחים". 1–4: "מעט דיווחים" ומספר, בלי אחוזים. 5 ומעלה: "X מתוך Y".
// הדיווחים לא משנים את הציון. המספרים מגיעים מ-src/engine/reportsStore.ts (מקומי או מהשרת).
// מתי נוגעים: כשמשנים את ניסוח הסיכום. הכללים המספריים ב-config/reports.json.
import rules from '../../config/reports.json';
import { FieldReport, FieldReportSummary } from '../types';
import { Lang, translate } from '../i18n/translate';
import { countLocal, ReportCounts } from '../engine/reportsStore';

export const REPORT_WINDOW_HOURS = rules.windowHours;
export const MIN_REPORTS_FOR_SUMMARY = rules.minReportsForSummary;

export function summarizeCounts(counts: ReportCounts, activityLabel: string, lang: Lang = 'he'): FieldReportSummary {
  const { total, positive, topReasons } = counts;
  const enough = total >= MIN_REPORTS_FOR_SUMMARY;
  let summaryText = translate(lang, 'reports.summary.none');
  if (total > 0 && !enough) summaryText = translate(lang, 'reports.summary.fewCount', { n: total });
  if (enough) summaryText = translate(lang, 'reports.summary.many', { positive, total, activity: activityLabel });
  return {
    totalReports: total,
    positiveReports: enough ? positive : 0,
    negativeReports: enough ? total - positive : 0,
    positivePercentage: enough ? Math.round((positive / total) * 100) : 0,
    topReasons: enough ? topReasons : [],
    summaryText,
  };
}

// סיכום מרשימת דיווחים (משמש בבדיקות ובמצב מקומי)
export function summarizeFieldReports(reports: FieldReport[], activityLabel: string, lang: Lang = 'he'): FieldReportSummary {
  const now = Date.now();
  const local = reports.map((r) => ({ beachId: r.beachId, activity: r.activity, isAccurate: r.isAccurate, reason: r.reason ?? null, at: new Date(r.createdAt).getTime() }));
  const first = reports[0];
  const counts = first ? countLocal(local, first.beachId, first.activity, now) : { total: 0, positive: 0, topReasons: [] };
  return summarizeCounts(counts, activityLabel, lang);
}
