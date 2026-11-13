-- טבלת דיווחי השטח (Cloudflare D1, SQLite).
-- אין כאן מיקום, אין טקסט חופשי ואין פרטים אישיים.
-- reporter = מזהה אנונימי מוצפן (hash), לא המזהה המקורי מהמכשיר.
CREATE TABLE IF NOT EXISTS reports (
  id          TEXT PRIMARY KEY,
  beach_id    TEXT    NOT NULL,
  activity    TEXT    NOT NULL,
  vote        INTEGER NOT NULL CHECK (vote IN (0, 1)),
  reason      TEXT,
  reporter    TEXT    NOT NULL,
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_beach_activity_time ON reports (beach_id, activity, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_time ON reports (reporter, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_time ON reports (created_at);
