-- Migration: Create event_attachments table for file uploads

CREATE TABLE IF NOT EXISTS event_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_event_attachments_event_id ON event_attachments(event_id);
CREATE INDEX idx_event_attachments_uploaded_by ON event_attachments(uploaded_by);
CREATE INDEX idx_event_attachments_uploaded_at ON event_attachments(uploaded_at);
