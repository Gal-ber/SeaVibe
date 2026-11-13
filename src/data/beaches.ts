// קטלוג החופים והפעילויות.
// החופים נקראים מ-config/beaches.json. מוסיפים או משנים חוף שם, לא כאן.
// מתי נוגעים: כשמוסיפים פעילות חדשה.
import catalog from '../../config/beaches.json';
import { Activity, BeachInfo } from '../types';

export const ACTIVITIES: Activity[] = [
  { id: 'beach', label: 'ישיבה בחוף', icon: 'Sun' },
  { id: 'swim', label: 'שחייה', icon: 'Waves' },
  { id: 'kids', label: 'ילדים', icon: 'Baby' },
  { id: 'surf', label: 'גלישה', icon: 'Zap' },
  { id: 'sup', label: 'SUP / קיאק', icon: 'Anchor' },
  { id: 'sail', label: 'שייט קצר', icon: 'Ship' },
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
