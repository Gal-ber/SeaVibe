-- עותקי התחזית שהמשימה המתוזמנת שמרה (נשמרים רק האחרונים), ומונה קריאות יומי למקור.
CREATE TABLE IF NOT EXISTS forecast_snapshots (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  INTEGER NOT NULL,
  body        TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_time ON forecast_snapshots (created_at);

CREATE TABLE IF NOT EXISTS fetch_log (
  day    TEXT    PRIMARY KEY,
  calls  INTEGER NOT NULL DEFAULT 0
);
