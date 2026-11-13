// מחבר את מסך הפירוט לשכבת האחסון של הדיווחים (src/engine/reportsStore.ts):
// טוען את סיכום הדיווחים של החוף והפעילות, את ההצבעה שלך, ומאפשר לשלוח דיווח.
// מתי נוגעים: כמעט אף פעם. ההחלטה מקומי או שרת נמצאת ב-config/app.config.json.
import { useCallback, useEffect, useState } from 'react';
import { ActivityId } from '../types';
import { getMyVote, loadCounts, MyVote, ReportCounts, reportsMode, submitReport, SubmitResult } from '../engine/reportsStore';

export function useFieldReports(beachId: string, activity: ActivityId) {
  const [counts, setCounts] = useState<ReportCounts | null>(null);
  const [myVote, setMyVote] = useState<MyVote | null>(() => getMyVote(beachId, activity));

  const refresh = useCallback(() => {
    loadCounts(beachId, activity).then(setCounts);
    setMyVote(getMyVote(beachId, activity));
  }, [beachId, activity]);

  useEffect(refresh, [refresh]);

  const submit = async (isAccurate: boolean, reason?: string): Promise<SubmitResult> => {
    const result = await submitReport(beachId, activity, isAccurate, reason ?? null);
    refresh();
    return result;
  };

  return { counts, myVote, submit, mode: reportsMode() };
}
