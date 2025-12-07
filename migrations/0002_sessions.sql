-- Migration for user sessions table (Cloudflare D1)
-- Stores session state for stateless Workers environment

CREATE TABLE IF NOT EXISTS user_sessions (
  userId TEXT PRIMARY KEY,
  addingStep TEXT NOT NULL DEFAULT 'idle',
  pendingTitle TEXT,
  editingId INTEGER,
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_updatedAt ON user_sessions(updatedAt);
