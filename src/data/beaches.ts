// קטלוג החופים והפעילויות.
// החופים נקראים מ-config/beaches.json. מוסיפים או משנים חוף שם, לא כאן.
// שמות הפעילויות נמצאים בקובצי הטקסטים (activity.<id>).
// מתי נוגעים: כשמוסיפים פעילות חדשה.
import catalog from '../../config/beaches.json';
import { Activity, BeachInfo } from '../types';
import { Lang } from '../i18n/translate';

export const ACTIVITIES: Activity[] = [
  { id: 'beach', icon: 'Sun' },
  { id: 'swim', icon: 'WavesLadder' },
  { id: 'kids', icon: 'Baby' },
  { id: 'surf', icon: 'Waves' },
  { id: 'sup', icon: 'Kayak' },
  { id: 'sail', icon: 'Sailboat' },
];

export const BEACHES: BeachInfo[] = catalog.beaches.map((b) => ({
  id: b.id,
  name: b.name.he,
  nameEn: b.name.en,
  city: b.city.he,
  cityEn: b.city.en,
  lat: b.lat,
  lng: b.lng,
}));

// שם החוף והעיר בשפה הנבחרת
export const beachName = (b: BeachInfo, lang: Lang) => (lang === 'he' ? b.name : b.nameEn);
export const beachCity = (b: BeachInfo, lang: Lang) => (lang === 'he' ? b.city : b.cityEn);

// ניקוי טקסט לחיפוש: בלי ניקוד, גרשיים, מקפים ורווחים כפולים, ובלי הבדל בין אותיות גדולות לקטנות
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/["'`\u05F3\u05F4]/g, '')
    .replace(/[-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// חיפוש פעילות לפי שם בעברית או באנגלית (למשל "גלישה" או "surf")
export function searchActivity(query: string, label: (id: Activity['id'], lang: Lang) => string): Activity['id'] | null {
  const q = normalizeSearch(query);
  if (q.length < 2) return null;
  const hit = ACTIVITIES.find((a) => (['he', 'en'] as Lang[]).some((l) => normalizeSearch(label(a.id, l)).includes(q)));
  return hit ? hit.id : null;
}

// חיפוש חוף בעברית או באנגלית (שם או עיר). לא ממציא חופים: מחזיר רק חופים מהקטלוג.
export function searchBeaches(query: string): BeachInfo[] {
  const q = normalizeSearch(query);
  if (!q) return [];
  return BEACHES.filter((b) => [b.name, b.nameEn, b.city, b.cityEn].some((field) => normalizeSearch(field).includes(q)));
}
