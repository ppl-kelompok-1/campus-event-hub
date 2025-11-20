-- Add max_capacity column to locations table
ALTER TABLE locations ADD COLUMN max_capacity INTEGER;

-- Update existing locations with default capacities (can be adjusted later by admins)
UPDATE locations SET max_capacity = 500 WHERE name = 'Main Auditorium';
UPDATE locations SET max_capacity = 50 WHERE name = 'Conference Room A';
UPDATE locations SET max_capacity = 50 WHERE name = 'Conference Room B';
UPDATE locations SET max_capacity = 300 WHERE name = 'Sports Complex';
UPDATE locations SET max_capacity = 200 WHERE name = 'Library Hall';
UPDATE locations SET max_capacity = 150 WHERE name = 'Student Center';
UPDATE locations SET max_capacity = 100 WHERE name = 'Outdoor Courtyard';
UPDATE locations SET max_capacity = 30 WHERE name = 'Seminar Room 1';
UPDATE locations SET max_capacity = 30 WHERE name = 'Seminar Room 2';
UPDATE locations SET max_capacity = 200 WHERE name = 'Cafeteria';
