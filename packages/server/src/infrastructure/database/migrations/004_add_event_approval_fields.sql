-- Add approval fields to events table
ALTER TABLE events ADD COLUMN approved_by INTEGER;
ALTER TABLE events ADD COLUMN approval_date TEXT;
ALTER TABLE events ADD COLUMN revision_comments TEXT;

-- Add foreign key constraint for approved_by
-- Note: SQLite doesn't support adding foreign key constraints to existing tables
-- The constraint will be enforced at the application level

-- Create index for approved_by for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_approved_by ON events(approved_by);

-- Create index for approval_date for faster sorting
CREATE INDEX IF NOT EXISTS idx_events_approval_date ON events(approval_date);

-- Create index for events pending approval
CREATE INDEX IF NOT EXISTS idx_events_pending_approval ON events(status) WHERE status = 'pending_approval';