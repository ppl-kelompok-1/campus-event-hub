-- Create locations table for managing event venues
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON locations(created_at DESC);

-- Seed initial locations (common campus venues)
INSERT INTO locations (name, is_active) VALUES
    ('Main Auditorium', 1),
    ('Conference Room A', 1),
    ('Conference Room B', 1),
    ('Sports Complex', 1),
    ('Library Hall', 1),
    ('Student Center', 1),
    ('Outdoor Courtyard', 1),
    ('Seminar Room 1', 1),
    ('Seminar Room 2', 1),
    ('Cafeteria', 1);
