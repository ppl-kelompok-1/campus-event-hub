-- Migration: Change events.location from name (TEXT) to location_id (INTEGER)
-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

-- Step 1: Create new events table with location_id and nullable location
CREATE TABLE events_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL,
    location TEXT,
    location_id INTEGER,
    max_attendees INTEGER,
    created_by INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    approved_by INTEGER,
    approval_date TEXT,
    revision_comments TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 2: Copy data from old table and populate location_id
INSERT INTO events_new (
    id, title, description, event_date, event_time, location, location_id,
    max_attendees, created_by, status, approved_by, approval_date,
    revision_comments, created_at, updated_at
)
SELECT
    id, title, description, event_date, event_time, location,
    (SELECT l.id FROM locations l WHERE LOWER(l.name) = LOWER(events.location) LIMIT 1) as location_id,
    max_attendees, created_by, status, approved_by, approval_date,
    revision_comments, created_at, updated_at
FROM events;

-- Step 3: For any events without a matching location_id, set to first available location
UPDATE events_new
SET location_id = (SELECT id FROM locations WHERE is_active = 1 ORDER BY id LIMIT 1)
WHERE location_id IS NULL;

-- Step 4: Drop old table
DROP TABLE events;

-- Step 5: Rename new table to events
ALTER TABLE events_new RENAME TO events;

-- Step 6: Create index for foreign key performance
CREATE INDEX IF NOT EXISTS idx_events_location_id ON events(location_id);

-- Step 7: Recreate index on created_by if it existed
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);