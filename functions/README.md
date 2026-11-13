# functions — הכתובות של השרת באתר (Cloudflare Pages Functions)

- `api/reports.ts` ← `/api/reports` (דיווחי שטח).
- `data/[file].ts` ← `/data/forecast.json`. במצב `FORECAST_MODE = live` מגיש את התחזית האמיתית האחרונה. בכל מצב אחר, את קובץ נתוני הדוגמה.

הקבצים כאן רק מחברים. הלוגיקה ב-`server/`.
