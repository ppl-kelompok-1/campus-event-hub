-- Create event approval history table for audit trail
CREATE TABLE IF NOT EXISTS event_approval_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('submitted', 'approved', 'revision_requested')),
  performed_by INTEGER NOT NULL,
  performer_name TEXT NOT NULL,
  comments TEXT,
  status_before TEXT NOT NULL,
  status_after TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_approval_history_event_id ON event_approval_history(event_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_performed_by ON event_approval_history(performed_by);
CREATE INDEX IF NOT EXISTS idx_approval_history_created_at ON event_approval_history(created_at);
CREATE INDEX IF NOT EXISTS idx_approval_history_action ON event_approval_history(action);
