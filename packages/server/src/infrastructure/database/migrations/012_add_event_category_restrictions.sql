-- Add allowed_categories column to events table (JSON array)
ALTER TABLE events ADD COLUMN allowed_categories TEXT DEFAULT NULL;

-- Create index for events with category restrictions
CREATE INDEX idx_events_allowed_categories ON events(allowed_categories);
