-- The deck index. Derived, never authoritative.
--
-- Every row here is reconstructible from the .md files under
-- SLIDEMASTER_DECKS_DIR. Nothing may be stored that exists nowhere else —
-- see docs/rules/principles.md #2 and the invariant in docs/rules/testing.md.

CREATE TABLE decks (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  topic      TEXT NOT NULL,
  path       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE tags (
  deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  tag     TEXT NOT NULL,
  PRIMARY KEY (deck_id, tag)
);

-- Justifies itself: /decks groups by topic and this is the grouping key.
-- Every other access is by primary key or a full scan of a library that is
-- tens of rows, not thousands.
CREATE INDEX decks_topic_idx ON decks(topic);
