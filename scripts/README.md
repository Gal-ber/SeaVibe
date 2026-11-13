# scripts — סקריפטים

- `fetcher/` — המשימה המתוזמנת ב-Cloudflare, שמושכת תחזית מ-Open-Meteo כל 3 שעות. הכתובות נלקחות רק מ-`data-sources/sources.config.json`. הבלם הקשיח: 100 קריאות ביום.
- `generate-mock.mjs` — מייצר את נתוני הדוגמה (`npm run mock:generate`).

פריסת המשימה המתוזמנת רק באישור הבעלים. ההוראות ב-`docs/deploy-cloudflare.md`.
