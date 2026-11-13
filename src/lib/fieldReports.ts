// דיווחי שטח: סינון הדיווחים של חוף ופעילות מ-4 השעות האחרונות, וסיכום שלהם בטקסט.
// הדיווחים שמורים במכשיר בלבד (עד שלב 4). הסיבה נשמרת כמפתח (reason.*), לא כטקסט חופשי.
// מתי נוגעים: כשמשנים את כללי הסיכום (שלב 3ג).
import { FieldReport, FieldReportSummary, ActivityId } from '../types';
import { Lang, translate } from '../i18n/translate';

export function getRecentFieldReports(reports: FieldReport[], beachId: string, activity: ActivityId, hours = 4): FieldReport[] {
  const limit = hours * 60 * 60 * 1000;
  return reports.filter(
    (r) => r.beachId === beachId && r.activity === activity && Date.now() - new Date(r.createdAt).getTime() < limit,
  );
}

export function summarizeFieldReports(reports: FieldReport[], activityLabel: string, lang: Lang = 'he'): FieldReportSummary {
  const totalReports = reports.length;
  const positiveReports = reports.filter((r) => r.isAccurate).length;
  const reasonCounts: Record<string, number> = {};
  for (const r of reports) if (r.reason) reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  const topReasons = Object.entries(reasonCounts).sort(([, a], [, b]) => b - a).slice(0, 2).map(([r]) => r);

  let summaryText = translate(lang, 'reports.summary.none');
  if (totalReports > 0 && totalReports < 3) summaryText = translate(lang, 'reports.summary.few');
  if (totalReports >= 3) {
    summaryText = translate(lang, 'reports.summary.many', { positive: positiveReports, total: totalReports, activity: activityLabel });
  }

  return {
    totalReports,
    positiveReports,
    negativeReports: totalReports - positiveReports,
    positivePercentage: totalReports ? Math.round((positiveReports / totalReports) * 100) : 0,
    topReasons,
    summaryText,
  };
}
