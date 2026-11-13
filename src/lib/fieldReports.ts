/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FieldReport, FieldReportSummary, ActivityId } from '../types';

export function getRecentFieldReports(
  reports: FieldReport[],
  beachId: string,
  activity: ActivityId,
  hours: number = 4
): FieldReport[] {
  const now = Date.now();
  const timeLimit = hours * 60 * 60 * 1000;

  return reports.filter(r => 
    r.beachId === beachId && 
    r.activity === activity &&
    (now - new Date(r.createdAt || 0).getTime()) < timeLimit
  );
}

export function summarizeFieldReports(reports: FieldReport[], activityLabel: string): FieldReportSummary {
  const totalReports = reports.length;
  if (totalReports === 0) {
    return {
      totalReports: 0,
      positiveReports: 0,
      negativeReports: 0,
      positivePercentage: 0,
      topReasons: [],
      summaryText: "עדיין אין מספיק דיווחים מהשטח היום"
    };
  }

  const positiveReports = reports.filter(r => r.isAccurate).length;
  const negativeReports = totalReports - positiveReports;
  const positivePercentage = Math.round((positiveReports / totalReports) * 100);

  const reasons = reports.map(r => r.reason).filter(Boolean) as string[];
  const reasonCounts: Record<string, number> = {};
  reasons.forEach(r => {
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });

  const topReasons = Object.entries(reasonCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([r]) => r);

  let summaryText = "";
  if (totalReports < 3) {
    summaryText = "מעט דיווחים מהשטח — קחו בעירבון מוגבל";
  } else {
    summaryText = `${positiveReports} מתוך ${totalReports} דיווחים אישרו שזה מתאים ל${activityLabel}`;
  }

  return {
    totalReports,
    positiveReports,
    negativeReports,
    positivePercentage,
    topReasons,
    summaryText
  };
}
