// נקודת הכניסה של Cloudflare Pages Functions לכתובת /api/reports.
// כל הלוגיקה נמצאת ב-server/reports/. הקובץ הזה רק מחבר אותה ל-Cloudflare.
// פעיל רק אחרי פריסה (באישור הבעלים). באתר המקומי ובמצב local הוא לא בשימוש.
import { handleReportsRequest, ReportsEnv } from '../../server/reports/handler';

export const onRequest = (context: { request: Request; env: ReportsEnv }) =>
  handleReportsRequest(context.request, context.env, Date.now());
