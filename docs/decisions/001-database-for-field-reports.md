# החלטה 001: מסד נתונים לדיווחי שטח (שלב 4)

- **סטטוס:** אושר על ידי הבעלים (2026-11-13)
- **תאריך:** 2026-11-13
- **הקשר:** שלב 4 בתוכנית העבודה — דיווחי שטח אמיתיים. עד שלב זה הדיווחים נשמרים רק במכשיר.

## מה שומרים
דיווחי שטח בלבד: חוף, פעילות, "מתאים / לא מתאים", סיבה מתוך רשימה קבועה, ושעה.
אין מיקום, אין טקסט חופשי ואין פרטים אישיים. כמות הנתונים קטנה מאוד.

**הסיכון האמיתי הוא מספר הקריאות, לא הנפח.** כל פתיחה של מסך הפירוט קוראת את הדיווחים של אותו חוף.

**הערכה גסה לפיילוט** (500 משתמשים ביום):
- כ-1,000 דיווחים ביום.
- כ-5,000 פתיחות של מסך הפירוט ביום.

## הנחות יסוד לכל ספק
1. **השמירה עוברת דרך שרת קטן שלנו בכתובת של האתר עצמו** (`/api/reports`). הדפדפן לא פונה לספק ישירות.
   מדיניות האבטחה (CSP) נשארת "רק האתר שלנו", אין מפתחות בדפדפן, ואפשר להגביל קצב ולסנן כפילויות בצד השרת.
2. **בלי כרטיס אשראי.** כשנגמרת המכסה החינמית, השירות נעצר עד היום הבא ולא מחייב.
3. **מעבר מסודר לתשלום:** אם הבעלים יחליט להתרחב, ההחלפה תהיה רק בהגדרה, בלי לכתוב מחדש.

## השוואת הספקים (נכון לנובמבר 2026)

| ספק | מה מקבלים בחינם | כרטיס אשראי | מה קורה בחריגה | השדרוג הראשון | התאמה |
|---|---|---|---|---|---|
| **Cloudflare D1 + Workers** | 5 מיליון קריאות ו-100 אלף כתיבות ביום. 5GB בסך הכול (500MB לכל מסד). 100 אלף בקשות לשרת ביום. | לפי מקורות לא רשמיים, לא נדרש. צריך לוודא. | השאילתות נעצרות עד חצות UTC, בלי חיוב | 5$ לחודש | הכי גבוהה |
| **Supabase** (Postgres) | 500MB, 2 פרויקטים, 5GB תעבורה | לא נדרש | לפי מקור אחד הפרויקט עובר לקריאה בלבד. לא אומת. | 25$ לחודש | גבוהה |
| **Neon** (Postgres) | 1GB לפרויקט, 100 שעות מחשוב בחודש, נרדם כשאין שימוש | לא נדרש | המחשוב נעצר עד החודש הבא. הנתונים לא נמחקים. | לפי שימוש | טובה |
| **Turso** (SQLite) | 5GB, 500 מיליון קריאות ו-10 מיליון כתיבות בחודש | לא נדרש | לא נבדק | 5–6$ לחודש | טובה |
| **Firebase Firestore** | 1GB, 50 אלף קריאות ו-20 אלף כתיבות ביום | בחינם לא נדרש. לשרת (Functions) צריך Blaze. | השירות נעצר עד מחר | לפי שימוש (Blaze, בלי תקרת חיוב) | בינונית |
| **Appwrite Cloud** | 500 אלף קריאות ו-250 אלף כתיבות בחודש | לא נדרש | הפרויקט "קופא". מושהה אחרי 7 ימים בלי שימוש ונמחק אחרי 90. | 25$ לחודש | נמוכה |
| **MongoDB Atlas M0** | 512MB, עד 100 פעולות בשנייה | לא נדרש | עלול לכבות אשכול שלא בשימוש | לפי שימוש | נמוכה |

## היתרונות והסיכונים

### Cloudflare D1 + Workers (מומלץ)
- ✅ מסמך הדרישות כבר בחר ב-Cloudflare Pages לאירוח. השרת והמסד יושבים באותו מקום ובאותה כתובת של האתר.
- ✅ המכסה היומית החינמית גבוהה פי 100 מ-Firebase בקריאות.
- ✅ אפשר לפתח ולבדוק הכול על המחשב, עם מסד מקומי ובלי אינטרנט. הכלי לזה (wrangler) חינמי.
- ✅ המסד הוא SQLite רגיל, כך שקל להעביר את הנתונים לספק אחר.
- ⚠️ אין לוח ניהול מוכן ואין מערכת משתמשים מובנית. ב-MVP אין משתמשים.
- ⚠️ לא נמצא אישור רשמי לכך שהרשמה לא דורשת כרטיס אשראי. לבדוק בהרשמה.

### Supabase (אפשרות שנייה)
- ✅ Postgres סטנדרטי (הכי קל לעבור ממנו), לוח ניהול נוח, ומערכת משתמשים אם יהיו חשבונות בעתיד.
- ⚠️ פרויקט חינמי מושהה אחרי שבוע בלי שימוש.
- ⚠️ אין גיבויים אוטומטיים בחינם, והשדרוג הראשון 25$.

### Firebase (לא מומלץ כאן)
- ⚠️ 50 אלף קריאות ביום עלולות להיגמר: 2,500 פתיחות מסך × 20 דיווחים. אפשר לעקוף בעזרת "מסמך סיכום", אבל זה מסבך.
- ⚠️ שרת (Cloud Functions) דורש, לפי מקורות שונים, את תוכנית Blaze עם כרטיס אשראי. ב-Blaze אין תקרת חיוב, יש רק התראות.
- ⚠️ בלי שרת, הדפדפן פונה ישירות ל-Google. זה סותר את הנחת היסוד הראשונה ואת מדיניות האבטחה.
- ⚠️ מבנה נתונים ייחודי ל-Firebase, ולכן קשה לעבור ממנו.

### Neon / Turso / Appwrite / MongoDB Atlas
- Neon ו-Turso טובים, אבל צריכים שרת נפרד (בפועל Cloudflare Workers), כלומר שני חשבונות במקום אחד.
- Appwrite ו-MongoDB Atlas בעייתיים בגלל השהיה או מחיקה של פרויקטים לא פעילים, ובגלל המכסות הנמוכות.

## התוכנית לשלב 4, אחרי בחירת ספק
1. **שכבת אחסון אחת לדיווחים**, עם מתג `reportsMode: "local" | "remote"`. ברירת המחדל: `local`.
2. **השרת הקטן** (`/api/reports`):
   - בודק כל דיווח: חוף ופעילות מהקטלוג, וסיבה מהרשימה הקבועה.
   - מזהה אנונימי אקראי מהמכשיר, שנשמר בשרת רק בצורה מוצפנת (hash).
   - דיווח אחד לכל חוף ופעילות ב-4 שעות, והגבלת קצב.
   - מוחק לבד דיווחים בני יותר מ-7 ימים.
3. **פיתוח ובדיקות על המחשב בלבד**, מול מסד מקומי.
4. **רק אחרי אישור הבעלים:** הבעלים פותח חשבון, שומר מפתח ב-GitHub Secrets, ומאשר פריסה ראשונה לסביבת בדיקה.

## ההחלטה
1. **ספק:** Cloudflare D1 + Workers (Pages Functions), באותה כתובת של האתר.
2. **שמירת דיווחים:** 7 ימים, ואז מחיקה אוטומטית.
3. **חשבונות משתמשים:** אולי בעתיד. לכן שכבת האחסון בנויה כך שאפשר להחליף ספק בלי לשנות את המסכים.
4. **עד אישור נפרד לחיבור לאינטרנט:** הכול רץ ונבדק על המחשב בלבד, ו-`reportsMode` נשאר `local`.

## השאלות שנשאלו
1. איזה ספק? (המלצה: Cloudflare D1, גיבוי: Supabase)
2. האם בעתיד יהיו חשבונות משתמשים? אם כן, Supabase אטרקטיבי יותר.
3. כמה זמן לשמור דיווחים? (הצעה: 7 ימים)

## אזהרה על המקורות
רוב המספרים מבלוגים שעודכנו בשנת 2026. מקורות רשמיים נבדקו רק אצל Neon, Turso ו-Supabase.
לפני פתיחת חשבון: לוודא בעמוד התמחור הרשמי של הספק שנבחר אם נדרש כרטיס אשראי, ומה קורה בחריגה.

## מקורות
- [Firebase pricing 2026 – lilachbullock.com](https://www.lilachbullock.com/is-firebase-free/)
- [Spark vs Blaze – DEV Community](https://dev.to/androve2k/spark-vs-blaze-the-firebase-pricing-guide-i-wish-id-read-sooner-onb)
- [Firebase Pricing – we.inc](https://we.inc/guides/firebase-pricing)
- [Firebase official pricing](https://firebase.google.com/pricing?hl=he)
- [Supabase official pricing](https://supabase.com/pricing)
- [Supabase free tier limits – reeve.page](https://reeve.page/blog/supabase-free-plan-limits)
- [Supabase free tier 2026 – nayankyada.com](https://nayankyada.com/blog/supabase-pricing-2026-free-tier-limits-compute-costs-when-to-upgrade)
- [Cloudflare D1 free tier – DEV Community](https://dev.to/signops/cloudflare-d1-free-tier-limits-what-counts-as-a-row-written-d6e)
- [Cloudflare D1 free tier – tanstackship.com](https://tanstackship.com/blog/cloudflare-d1-free-tier-limits-2026)
- [Cloudflare D1 free limits – omidsaffari.com](https://omidsaffari.com/blog/cloudflare-d1-free-limits-queries-stop)
- [Cloudflare Workers limits (official)](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers free tier – DEV Community](https://dev.to/0012303/cloudflare-workers-has-a-free-tier-100k-requestsday-at-the-edge-with-kv-r2-and-d1-52k9)
- [Neon free plan limits (official)](https://neon.com/faqs/free-plan-limits-and-quotas)
- [Neon plans (official)](https://neon.com/docs/introduction/plans)
- [Turso pricing (official)](https://turso.tech/pricing.md)
- [Appwrite Cloud free tier – agentdeals.dev](https://agentdeals.dev/vendor/appwrite-cloud)
- [Appwrite pause/delete terms – GitHub](https://github.com/robhunter/agentdeals/pull/2367)
- [MongoDB Atlas free cluster limitations (official)](https://mongodb.com/docs/atlas/reference/free-shared-limitations/)
