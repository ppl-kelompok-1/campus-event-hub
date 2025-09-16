-- Add password and role fields to users table
ALTER TABLE users ADD COLUMN password TEXT;
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Create index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have default role if needed
UPDATE users SET role = 'user' WHERE role IS NULL;