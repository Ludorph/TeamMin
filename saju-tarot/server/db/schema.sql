CREATE TABLE IF NOT EXISTS saju_texts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,        -- ilgan | oheng | sipsin ...
  key TEXT NOT NULL,
  text TEXT NOT NULL,
  UNIQUE (category, key)
);
