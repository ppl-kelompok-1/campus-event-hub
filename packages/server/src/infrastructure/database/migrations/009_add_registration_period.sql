-- Migration: Replace event end datetime with registration period

-- Step 1: Add registration period columns
ALTER TABLE events ADD COLUMN registration_start_date TEXT;
ALTER TABLE events ADD COLUMN registration_start_time TEXT;
ALTER TABLE events ADD COLUMN registration_end_date TEXT;
ALTER TABLE events ADD COLUMN registration_end_time TEXT;

-- Step 2: Set default registration periods for existing events
-- Registration starts 7 days before event, ends 1 day before event
UPDATE events
SET
  registration_start_date = date(event_date, '-7 days'),
  registration_start_time = '00:00',
  registration_end_date = date(event_date, '-1 day'),
  registration_end_time = '23:59'
WHERE registration_start_date IS NULL;

-- Step 3: Remove event end datetime columns (added in migration 008)
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Create new events table without event_end_date and event_end_time
CREATE TABLE events_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  location_id INTEGER NOT NULL,
  max_attendees INTEGER,
  created_by INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_by INTEGER,
  approval_date TEXT,
  revision_comments TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  registration_start_date TEXT NOT NULL,
  registration_start_time TEXT NOT NULL,
  registration_end_date TEXT NOT NULL,
  registration_end_time TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Copy data from old table to new table
INSERT INTO events_new (
  id, title, description, event_date, event_time, location_id, max_attendees,
  created_by, status, approved_by, approval_date, revision_comments,
  created_at, updated_at, registration_start_date, registration_start_time,
  registration_end_date, registration_end_time
)
SELECT
  id, title, description, event_date, event_time, location_id, max_attendees,
  created_by, status, approved_by, approval_date, revision_comments,
  created_at, updated_at, registration_start_date, registration_start_time,
  registration_end_date, registration_end_time
FROM events;

-- Drop old table
DROP TABLE events;

-- Rename new table to events
ALTER TABLE events_new RENAME TO events;

-- Step 4: Recreate indexes
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_approved_by ON events(approved_by);
CREATE INDEX idx_events_location_id ON events(location_id);

-- Step 5: Create new indexes for registration period
CREATE INDEX idx_events_registration_start ON events(registration_start_date, registration_start_time);
CREATE INDEX idx_events_registration_end ON events(registration_end_date, registration_end_time);
