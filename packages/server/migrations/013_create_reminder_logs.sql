-- Create reminder_logs table to track sent reminders
CREATE TABLE reminder_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER,
    reminder_type TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Prevent duplicate reminders
    UNIQUE(event_id, user_id, reminder_type)
);

-- Create indexes for efficient querying
CREATE INDEX idx_reminder_logs_event_id ON reminder_logs(event_id);
CREATE INDEX idx_reminder_logs_user_id ON reminder_logs(user_id);
CREATE INDEX idx_reminder_logs_type ON reminder_logs(reminder_type);
