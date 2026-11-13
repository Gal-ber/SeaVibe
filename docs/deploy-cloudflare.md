# העלאת SeaVibes ל-Cloudflare (שלב 4): מדריך לבעלים

> **עדיין לא לבצע.** כל צעד כאן מחבר את האתר לאינטרנט, ולכן נעשה רק אחרי אישור מפורש (כללי ברזל 1 ו-6).
> עד אז האתר רץ על המחשב בלבד, והדיווחים נשמרים במכשיר (`reportsMode: "local"`).

## מה כבר מוכן (בלי אינטרנט)
- השרת הקטן של הדיווחים: `functions/api/reports.ts` ו-`server/reports/`.
- מבנה הטבלה: `migrations/0001_reports.sql`.
- הגדרות Cloudflare (בלי סודות): `wrangler.toml`.
- בדיקות שמריצות את קוד השרת האמיתי מול מסד מקומי: `tests/unit/server-reports.test.ts`, `tests/unit/reports-remote.test.ts`.

## הצעדים, לפי הסדר

### א. אתה עושה (פעם אחת)
1. **פתיחת חשבון Cloudflare** ב-cloudflare.com.
   - אם מבקשים כרטיס אשראי: עוצרים ומודיעים לי (כלל 5).
2. **אישור בכתב** לחיבור הדיווחים לאינטרנט ולפריסה לסביבת בדיקה.

### ב. אני עושה, אחרי האישור (ואתה מאשר כל פקודה)
3. התקנת הכלי של Cloudflare (`wrangler`, חינמי) וכיבוי שליחת נתוני שימוש: `npx wrangler telemetry disable`.
4. התחברות: `npx wrangler login` (נפתח דפדפן, ואתה מאשר בעצמך).
5. יצירת המסד: `npx wrangler d1 create seavibes-reports`, והעתקת ה-`database_id` לקובץ `wrangler.toml`.
6. יצירת הטבלה: `npx wrangler d1 migrations apply seavibes-reports --remote`.
7. **"המלח" הסודי — אתה מזין בעצמך, לא בצ'אט ולא בקוד:**
   `openssl rand -hex 32 | npx wrangler pages secret put REPORTER_SALT --project-name seavibes` (לסביבה הציבורית)
   `openssl rand -hex 32 | npx wrangler pages secret put REPORTER_SALT --project-name seavibes --env preview` (לאתר הבדיקה)
   חשוב: כל סביבה צריכה סוד משלה.
   ערך מומלץ: 64 תווים אקראיים (למשל מהפקודה `openssl rand -hex 32`).
8. שינוי `reportsMode` ל-`remote` בקובץ `config/app.config.json` (שינוי נפרד שאתה סוקר).
9. פריסה לסביבת בדיקה בלבד: `npx wrangler pages deploy dist --branch=preview`.

### ג. בודקים יחד בסביבת הבדיקה
- דיווח נשמר ונספר נכון, ואפשר לשנות הצבעה.
- אין מיקום ואין טקסט חופשי במסד (בודקים בלוח הניהול של Cloudflare).
- הגבלת הקצב עובדת (יותר מ-20 דיווחים בשעה נחסמים).
- דיווחים בני יותר מ-7 ימים נמחקים.

### ד. רק אחרי אישור נוסף
- פריסה לכתובת הציבורית (פרודקשן).

## אם רוצים לבטל
- מחזירים `reportsMode` ל-`local`: האתר חוזר לשמירה במכשיר בלבד.
- בלוח הניהול של Cloudflare אפשר למחוק את המסד ואת הפרויקט.

## עלות
- **חינם:** 100 אלף בקשות לשרת ביום, ובמסד 5 מיליון קריאות ו-100 אלף כתיבות ביום.
- **בחריגה:** השירות נעצר עד חצות UTC. אין חיוב, כל עוד לא שודרגה התוכנית.
- **שדרוג (רק אם תבחר):** Workers Paid, כ-5$ לחודש.

---

# שלב 5: תחזית אמיתית לאתר הבדיקה

> **לבצע רק אחרי "יוצאים לדרך" של הבעלים** (docs/decisions/002-live-forecast-source.md).

## מה כבר מוכן (בלי אינטרנט)
- מתאם Open-Meteo: `scripts/fetcher/openMeteo.ts`. הכתובות נלקחות רק מ-`data-sources/sources.config.json`.
- המשימה המתוזמנת: `scripts/fetcher/worker.ts`, כל 3 שעות (`scripts/fetcher/wrangler.toml`). הבלם הקשיח: 100 קריאות ביום.
- טבלאות: `migrations/0002_forecast.sql` (עותקי תחזית ומונה קריאות).
- הגשת התחזית באתר: `functions/data/[file].ts`. פעילה רק כש-`FORECAST_MODE = "live"`. תחזית ישנה מ-7 שעות מוצגת כ"לא זמין".
- בדיקות מול תשובות דוגמה בפורמט של Open-Meteo: `tests/unit/live-data.test.ts`.
- זמן עיבוד שנמדד: כ-1.2 מילישניות לריצה (המגבלה בתוכנית החינמית: 10).

## הצעדים
1. **התחברות מחדש עם הרשאה אחת נוספת** (`workers_scripts:write`: סקריפטים ותזמונים בלבד). הבעלים מאשר בדפדפן.
2. יצירת הטבלאות במסד: `npx wrangler d1 migrations apply seavibes-reports --remote`.
3. פריסת המשימה המתוזמנת: `cd scripts/fetcher && npx wrangler deploy`.
4. **משיכה חיה ראשונה:** ממתינים לריצה המתוזמנת הבאה (בדקה 5 של כל שלוש שעות), ובודקים במסד שנשמר עותק ושהמונה הוא 2.
5. בודקים את העותק: 7 חופים, 48 שעות, וערכים הגיוניים. בודקים במיוחד שהנקודות בים מחזירות גלים ולא null.
6. הפעלת התחזית האמיתית **באתר הבדיקה בלבד**: `FORECAST_MODE = "live"` לסביבת Preview, ופריסה מחדש (`npm run deploy:preview`).
7. הבעלים בודק באתר הבדיקה:
   - התגית "נתוני דוגמה" נעלמה.
   - זמן העדכון וייחוס Open-Meteo מוצגים.
   - הנתונים סבירים מול מה שרואים בחוף.

## ביטול
- הסרת `FORECAST_MODE` (או שינוי לערך אחר) ופריסה מחדש: האתר חוזר לנתוני דוגמה.
- כיבוי המשימה המתוזמנת: `npx wrangler delete seavibes-fetcher` (מתוך `scripts/fetcher`).
