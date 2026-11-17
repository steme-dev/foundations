-- The people who signed in with GitHub, kept by their GitHub id (a login can change), and the practices
-- each says they use. Deleting a person deletes their votes.
CREATE TABLE users (
  github_id INTEGER PRIMARY KEY,
  login TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE votes (
  github_id INTEGER NOT NULL REFERENCES users (github_id) ON DELETE CASCADE,
  practice TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (github_id, practice)
);

CREATE INDEX votes_by_practice ON votes (practice, created_at);
