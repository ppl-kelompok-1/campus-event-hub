-- Add category column to users table
ALTER TABLE users ADD COLUMN category TEXT NOT NULL DEFAULT 'mahasiswa';

-- Create index for filtering users by category
CREATE INDEX idx_users_category ON users(category);

-- Update existing users to have 'mahasiswa' category
UPDATE users SET category = 'mahasiswa' WHERE category IS NULL;
