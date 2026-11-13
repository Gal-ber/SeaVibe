// דיווחי שטח (FR-10): סינון הדיווחים של חוף ופעילות מ-4 השעות האחרונות, וסיכום שלהם בטקסט.
// 0 דיווחים: "עדיין אין מספיק דיווחים". 1–4: "מעט דיווחים" ומספר, בלי אחוזים. 5 ומעלה: "X מתוך Y".
// הדיווחים לא משנים את הציון. מתי נוגעים: כשמשנים את כללי הסיכום.
import { FieldReport, FieldReportSummary, ActivityId } from '../types';
import { Lang, translate } from '../i18n/translate';

export const REPORT_WINDOW_HOURS = 4;
export const MIN_REPORTS_FOR_SUMMARY = 5;

export function getRecentFieldReports(reports: FieldReport[], beachId: string, activity: ActivityId, hours = REPORT_WINDOW_HOURS): FieldReport[] {
  const limit = hours * 60 * 60 * 1000;
  return reports.filter(
    (r) => r.beachId === beachId && r.activity === activity && Date.now() - new Date(r.createdAt).getTime() < limit,
  );
}

export function summarizeFieldReports(reports: FieldReport[], activityLabel: string, lang: Lang = 'he'): FieldReportSummary {
  const totalReports = reports.length;
  const positiveReports = reports.filter((r) => r.isAccurate).length;
  const enough = totalReports >= MIN_REPORTS_FOR_SUMMARY;

  const reasonCounts: Record<string, number> = {};
  for (const r of reports) if (r.reason) reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  const topReasons = enough ? Object.entries(reasonCounts).sort(([, a], [, b]) => b - a).slice(0, 2).map(([r]) => r) : [];

  let summaryText = translate(lang, 'reports.summary.none');
  if (totalReports > 0 && !enough) summaryText = translate(lang, 'reports.summary.fewCount', { n: totalReports });
  if (enough) summaryText = translate(lang, 'reports.summary.many', { positive: positiveReports, total: totalReports, activity: activityLabel });

  return {
    totalReports,
    positiveReports,
    negativeReports: totalReports - positiveReports,
    positivePercentage: enough ? Math.round((positiveReports / totalReports) * 100) : 0,
    topReasons,
    summaryText,
  };
}
