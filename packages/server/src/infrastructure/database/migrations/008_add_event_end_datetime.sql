-- Migration: Add event end date and time for event duration/ranges

-- Step 1: Add event_end_date column (optional, for multi-day events)
ALTER TABLE events ADD COLUMN event_end_date TEXT;

-- Step 2: Add event_end_time column (required, defaults to event_time for existing events)
ALTER TABLE events ADD COLUMN event_end_time TEXT;

-- Step 3: Set event_end_time to event_time for all existing events
-- This makes existing events have the same start and end time (instant events)
UPDATE events
SET event_end_time = event_time
WHERE event_end_time IS NULL;

-- Step 4: Create index for querying events by end date
CREATE INDEX IF NOT EXISTS idx_events_event_end_date ON events(event_end_date);
