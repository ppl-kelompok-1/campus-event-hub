-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT NOT NULL, -- ISO 8601 date string
    event_time TEXT NOT NULL, -- Time in HH:MM format
    location TEXT NOT NULL,
    max_attendees INTEGER,
    created_by INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, published, cancelled, completed
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Foreign key constraint
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Create index for published events (most common query)
CREATE INDEX IF NOT EXISTS idx_events_published ON events(status, event_date) WHERE status = 'published';