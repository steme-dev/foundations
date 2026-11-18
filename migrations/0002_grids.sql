-- A grid shared without an account: the practices a reader chose, frozen when they shared it, kept
-- under a short random id. No person behind it, nothing else.
CREATE TABLE grids (
  id TEXT PRIMARY KEY,
  practices TEXT NOT NULL,
  created_at TEXT NOT NULL
);
