# Test Data Reference - Campus Event Hub

This document contains pre-defined test data sets for consistent testing across all test cases.

---

## Table of Contents
1. [User Accounts](#user-accounts)
2. [Event Test Data](#event-test-data)
3. [Location Test Data](#location-test-data)
4. [Validation Test Data](#validation-test-data)
5. [Boundary Values](#boundary-values)
6. [SQL Setup Scripts](#sql-setup-scripts)

---

## User Accounts

### Test User Credentials

| Role | Name | Email | Password | User ID | Purpose |
|------|------|-------|----------|---------|---------|
| **SUPERADMIN** | Super Admin | `superadmin@campus-event-hub.local` | `SuperAdmin123!` | 1 | Full system access, settings management |
| **ADMIN** | Admin User | `admin@test.com` | `Admin123!` | 2 | User management, location management |
| **APPROVER** | Approver User | `approver@test.com` | `Approver123!` | 3 | Event approval workflow |
| **USER** | Test User | `user@test.com` | `User123!` | 4 | Regular user, event creation |
| **USER** | John Doe | `john@test.com` | `John123!` | 5 | Secondary user for testing |
| **USER** | Jane Smith | `jane@test.com` | `Jane123!` | 6 | Tertiary user for testing |

### Role Hierarchy Reference

```
SUPERADMIN (Level 4)
    ↓ can manage
ADMIN (Level 3)
    ↓ can manage
APPROVER (Level 2)
    ↓ can manage
USER (Level 1)
```

### JWT Token Format

After successful login, you'll receive a token in this format:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "user@test.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckB0ZXN0LmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDAwODYzOTl9.example"
  }
}
```

Use the token in API requests:
```
Authorization: Bearer [TOKEN]
```

---

## Event Test Data

### Valid Event Data Templates

#### Template 1: Future Event (Valid)
```json
{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference featuring industry leaders and innovators",
  "eventDate": "2025-12-31",
  "eventTime": "14:00",
  "registrationStartDate": "2025-11-01",
  "registrationStartTime": "09:00",
  "registrationEndDate": "2025-12-30",
  "registrationEndTime": "17:00",
  "locationId": 1,
  "maxAttendees": 100
}
```

#### Template 2: Workshop Event (Valid)
```json
{
  "title": "Web Development Workshop",
  "description": "Hands-on workshop covering modern web development practices",
  "eventDate": "2026-03-15",
  "eventTime": "10:00",
  "registrationStartDate": "2025-12-01",
  "registrationStartTime": "08:00",
  "registrationEndDate": "2026-03-14",
  "registrationEndTime": "23:59",
  "locationId": 2,
  "maxAttendees": 30
}
```

#### Template 3: Unlimited Attendees (Valid)
```json
{
  "title": "Open Seminar",
  "description": "Free open seminar for all students",
  "eventDate": "2025-08-20",
  "eventTime": "13:00",
  "registrationStartDate": "2025-07-01",
  "registrationStartTime": "00:00",
  "registrationEndDate": "2025-08-19",
  "registrationEndTime": "23:59",
  "locationId": 1,
  "maxAttendees": null
}
```

### Event Status Examples

| Status | Description | Who Can Create | Visible to Public |
|--------|-------------|----------------|-------------------|
| `draft` | Initial state | USER creates | ❌ No |
| `pending_approval` | Awaiting approval | USER submits | ❌ No |
| `revision_requested` | Needs changes | APPROVER requests | ❌ No |
| `published` | Active event | APPROVER publishes | ✅ Yes |
| `cancelled` | Cancelled event | Creator/Admin cancels | ✅ Yes (marked) |
| `completed` | Past event | System/Admin | ✅ Yes (archived) |

### Sample Events for Testing

```sql
-- Event 1: Published event for registration testing
INSERT INTO events (title, description, event_date, event_time, registration_start_date,
registration_start_time, registration_end_date, registration_end_time, location_id,
max_attendees, created_by, status, created_at, updated_at) VALUES
('Summer Tech Fest 2025', 'Annual technology festival', '2025-12-31', '14:00',
'2025-11-01', '09:00', '2025-12-30', '17:00', 1, 100, 4, 'published',
datetime('now'), datetime('now'));

-- Event 2: Draft event for approval workflow testing
INSERT INTO events (title, description, event_date, event_time, registration_start_date,
registration_start_time, registration_end_date, registration_end_time, location_id,
max_attendees, created_by, status, created_at, updated_at) VALUES
('Draft Workshop', 'Workshop in draft state', '2026-06-15', '10:00',
'2025-12-01', '08:00', '2026-06-14', '18:00', 2, 30, 4, 'draft',
datetime('now'), datetime('now'));

-- Event 3: Event with limited capacity (10 attendees)
INSERT INTO events (title, description, event_date, event_time, registration_start_date,
registration_start_time, registration_end_date, registration_end_time, location_id,
max_attendees, created_by, status, created_at, updated_at) VALUES
('Limited Capacity Event', 'Testing max attendees', '2025-09-20', '15:00',
'2025-08-01', '00:00', '2025-09-19', '23:59', 1, 10, 3, 'published',
datetime('now'), datetime('now'));

-- Event 4: Pending approval event
INSERT INTO events (title, description, event_date, event_time, registration_start_date,
registration_start_time, registration_end_date, registration_end_time, location_id,
max_attendees, created_by, status, created_at, updated_at) VALUES
('Pending Event', 'Waiting for approval', '2025-10-10', '09:00',
'2025-08-15', '00:00', '2025-10-09', '23:59', 2, 50, 4, 'pending_approval',
datetime('now'), datetime('now'));
```

---

## Location Test Data

### Active Locations

```sql
INSERT INTO locations (id, name, is_active, created_at, updated_at) VALUES
(1, 'Main Auditorium', 1, datetime('now'), datetime('now')),
(2, 'Conference Room A', 1, datetime('now'), datetime('now')),
(3, 'Conference Room B', 1, datetime('now'), datetime('now')),
(4, 'Lecture Hall 101', 1, datetime('now'), datetime('now'));
```

### Inactive Location (for toggle testing)

```sql
INSERT INTO locations (id, name, is_active, created_at, updated_at) VALUES
(5, 'Inactive Location', 0, datetime('now'), datetime('now'));
```

### Location Test Scenarios

| Location Name | Status | Used by Events | Can Delete? |
|---------------|--------|----------------|-------------|
| Main Auditorium | Active | Yes | ❌ No |
| Conference Room A | Active | Yes | ❌ No |
| Conference Room B | Active | No | ✅ Yes |
| Lecture Hall 101 | Active | No | ✅ Yes |
| Inactive Location | Inactive | No | ✅ Yes |

---

## Validation Test Data

### Valid Inputs ✅

#### Email Formats (Valid)
```
user@test.com
john.doe@example.com
jane_smith@university.edu
admin+test@campus.local
test.user123@domain.co.id
```

#### Date Formats (Valid - YYYY-MM-DD)
```
2025-01-01
2025-12-31
2026-06-15
2025-02-28
2024-12-01
```

#### Time Formats (Valid - HH:MM)
```
00:00
09:00
14:30
18:45
23:59
```

#### Password Formats (Valid - min 8 chars)
```
Password123!
SecurePass1
MyP@ssw0rd
Test1234
LongPassword123
```

### Invalid Inputs ❌

#### Email Formats (Invalid)
```
invalidemail          # No @ symbol
user@                 # No domain
@domain.com           # No local part
user@domain           # No TLD
user name@test.com    # Contains space
user@domain..com      # Double dot
```

#### Date Formats (Invalid)
```
31-12-2025            # Wrong format (DD-MM-YYYY)
12/31/2025            # Wrong format (MM/DD/YYYY)
2025/12/31            # Wrong separator
31.12.2025            # Wrong separator
2025-13-01            # Invalid month
2025-02-30            # Invalid date
```

#### Time Formats (Invalid)
```
14:00:00              # Too many parts (HH:MM:SS)
2:00                  # Missing leading zero
25:00                 # Invalid hour
14:60                 # Invalid minute
14.00                 # Wrong separator
14-00                 # Wrong separator
```

#### Password Formats (Invalid)
```
Pass1                 # Too short (< 8 chars)
Pass12                # Too short
1234567               # Too short
                      # Empty
       # Whitespace only
```

### Business Rule Violations

#### Event Date Validation

**❌ Registration End After Event Date:**
```json
{
  "eventDate": "2025-12-31",
  "eventTime": "14:00",
  "registrationEndDate": "2026-01-01",  // INVALID: After event
  "registrationEndTime": "12:00"
}
```

**❌ Registration Start After Registration End:**
```json
{
  "registrationStartDate": "2025-12-01",
  "registrationStartTime": "18:00",
  "registrationEndDate": "2025-12-01",
  "registrationEndTime": "09:00"          // INVALID: Before start
}
```

**❌ Registration End After Event:**
```json
{
  "eventDate": "2025-12-31",
  "registrationEndDate": "2025-12-31",
  "eventTime": "10:00",
  "registrationEndTime": "15:00"          // INVALID: After event
}
```

#### Role Assignment Violations

**❌ Admin Creating Superadmin:**
```json
{
  "name": "Fake Superadmin",
  "email": "fake@test.com",
  "password": "Password123!",
  "role": "superadmin"                    // INVALID: Admin cannot assign superadmin
}
```

**❌ User Creating Other Users:**
```json
// Regular USER role attempting to call POST /users
// Expected: 403 Forbidden
```

---

## Boundary Values

### String Length Boundaries

| Field | Min Length | Max Length | Test Values |
|-------|------------|------------|-------------|
| Name | 1 | 255 | `"A"` (min), `"A".repeat(255)` (max), `"A".repeat(256)` (over) |
| Email | 5 | 255 | `"a@b.c"` (min valid), `"x".repeat(250)+"@test.com"` (max) |
| Password | 8 | - | `"Pass1234"` (min), `"Pass123"` (under) |
| Event Title | 1 | - | `"A"` (min), `""` (invalid empty) |

### Numeric Boundaries

#### Max Attendees
```json
{
  "maxAttendees": null       // ✅ Valid (unlimited)
}
{
  "maxAttendees": 1          // ✅ Valid (minimum)
}
{
  "maxAttendees": 0          // ❌ Invalid (must be positive or null)
}
{
  "maxAttendees": -10        // ❌ Invalid (negative)
}
{
  "maxAttendees": 10000      // ✅ Valid (large number)
}
```

#### Pagination
```
?page=1&limit=10             // ✅ Valid
?page=0&limit=10             // ❌ Invalid (page starts at 1)
?page=1&limit=0              // ❌ Invalid (limit must be positive)
?page=1&limit=100            // ✅ Valid
?page=999999&limit=10        // ✅ Valid (returns empty if no data)
```

### Date Boundaries

#### Past, Present, Future Dates
```javascript
const today = new Date().toISOString().split('T')[0];
const yesterday = // Calculate yesterday
const tomorrow = // Calculate tomorrow

// Event Date Tests
{
  "eventDate": yesterday      // ❌ May be invalid (business rule)
  "eventDate": today          // ✅ Valid (today)
  "eventDate": tomorrow       // ✅ Valid (future)
}
```

#### Registration Period Edge Cases
```json
// Same-day event and registration end
{
  "eventDate": "2025-12-31",
  "eventTime": "14:00",
  "registrationEndDate": "2025-12-31",
  "registrationEndTime": "13:59"          // ✅ Valid (1 min before)
}

// Registration end exactly at event time
{
  "eventDate": "2025-12-31",
  "eventTime": "14:00",
  "registrationEndDate": "2025-12-31",
  "registrationEndTime": "14:00"          // ✅ Valid (same time)
}
```

---

## SQL Setup Scripts

### Complete Test Database Setup

```sql
-- ============================================
-- CAMPUS EVENT HUB - TEST DATA SETUP SCRIPT
-- ============================================
-- Run this script to set up complete test environment
-- Database: SQLite (packages/server/data/app.db)

-- Clear existing test data (optional, use with caution)
-- DELETE FROM event_attachments;
-- DELETE FROM event_approval_history;
-- DELETE FROM event_registrations;
-- DELETE FROM events;
-- DELETE FROM locations;
-- DELETE FROM users WHERE id > 1;

-- ============================================
-- 1. TEST USERS
-- ============================================
-- Note: Passwords need to be hashed with bcrypt before insertion
-- Use the application's registration endpoint or hash manually

-- Superadmin (ID: 1)
-- Email: superadmin@campus-event-hub.local
-- Password: SuperAdmin123!

-- Admin (ID: 2)
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(2, 'Admin User', 'admin@test.com', '[BCRYPT_HASH_HERE]', 'admin', datetime('now'), datetime('now'));

-- Approver (ID: 3)
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(3, 'Approver User', 'approver@test.com', '[BCRYPT_HASH_HERE]', 'approver', datetime('now'), datetime('now'));

-- Regular User 1 (ID: 4)
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(4, 'Test User', 'user@test.com', '[BCRYPT_HASH_HERE]', 'user', datetime('now'), datetime('now'));

-- Regular User 2 (ID: 5)
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(5, 'John Doe', 'john@test.com', '[BCRYPT_HASH_HERE]', 'user', datetime('now'), datetime('now'));

-- Regular User 3 (ID: 6)
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(6, 'Jane Smith', 'jane@test.com', '[BCRYPT_HASH_HERE]', 'user', datetime('now'), datetime('now'));

-- ============================================
-- 2. TEST LOCATIONS
-- ============================================

INSERT INTO locations (id, name, is_active, created_at, updated_at) VALUES
(1, 'Main Auditorium', 1, datetime('now'), datetime('now')),
(2, 'Conference Room A', 1, datetime('now'), datetime('now')),
(3, 'Conference Room B', 1, datetime('now'), datetime('now')),
(4, 'Lecture Hall 101', 1, datetime('now'), datetime('now')),
(5, 'Inactive Location', 0, datetime('now'), datetime('now'));

-- ============================================
-- 3. TEST EVENTS
-- ============================================

-- Event 1: Published event for registration testing
INSERT INTO events (id, title, description, event_date, event_time,
registration_start_date, registration_start_time, registration_end_date,
registration_end_time, location_id, max_attendees, created_by, status,
created_at, updated_at) VALUES
(1, 'Summer Tech Fest 2025', 'Annual technology festival with workshops and talks',
'2025-12-31', '14:00', '2025-11-01', '09:00', '2025-12-30', '17:00',
1, 100, 4, 'published', datetime('now'), datetime('now'));

-- Event 2: Draft event for approval workflow
INSERT INTO events (id, title, description, event_date, event_time,
registration_start_date, registration_start_time, registration_end_date,
registration_end_time, location_id, max_attendees, created_by, status,
created_at, updated_at) VALUES
(2, 'Draft Workshop', 'Workshop in draft state for testing',
'2026-06-15', '10:00', '2025-12-01', '08:00', '2026-06-14', '18:00',
2, 30, 4, 'draft', datetime('now'), datetime('now'));

-- Event 3: Limited capacity event
INSERT INTO events (id, title, description, event_date, event_time,
registration_start_date, registration_start_time, registration_end_date,
registration_end_time, location_id, max_attendees, created_by, status,
created_at, updated_at) VALUES
(3, 'Limited Capacity Event', 'Testing max attendees functionality',
'2025-09-20', '15:00', '2025-08-01', '00:00', '2025-09-19', '23:59',
1, 10, 3, 'published', datetime('now'), datetime('now'));

-- Event 4: Pending approval event
INSERT INTO events (id, title, description, event_date, event_time,
registration_start_date, registration_start_time, registration_end_date,
registration_end_time, location_id, max_attendees, created_by, status,
created_at, updated_at) VALUES
(4, 'Pending Event', 'Waiting for approval',
'2025-10-10', '09:00', '2025-08-15', '00:00', '2025-10-09', '23:59',
2, 50, 4, 'pending_approval', datetime('now'), datetime('now'));

-- Event 5: Revision requested event
INSERT INTO events (id, title, description, event_date, event_time,
registration_start_date, registration_start_time, registration_end_date,
registration_end_time, location_id, max_attendees, created_by, status,
revision_comments, created_at, updated_at) VALUES
(5, 'Revision Event', 'Event needing revisions',
'2025-11-25', '13:00', '2025-10-01', '00:00', '2025-11-24', '23:59',
3, 40, 4, 'revision_requested',
'Please add more details to the description',
datetime('now'), datetime('now'));

-- Event 6: Cancelled event
INSERT INTO events (id, title, description, event_date, event_time,
registration_start_date, registration_start_time, registration_end_date,
registration_end_time, location_id, max_attendees, created_by, status,
created_at, updated_at) VALUES
(6, 'Cancelled Event', 'This event has been cancelled',
'2025-08-10', '16:00', '2025-07-01', '00:00', '2025-08-09', '23:59',
4, 60, 3, 'cancelled', datetime('now'), datetime('now'));

-- ============================================
-- 4. SAMPLE EVENT REGISTRATIONS
-- ============================================

-- User 4 registered for Event 1
INSERT INTO event_registrations (event_id, user_id, registration_date, status,
created_at, updated_at) VALUES
(1, 4, datetime('now'), 'registered', datetime('now'), datetime('now'));

-- User 5 registered for Event 1
INSERT INTO event_registrations (event_id, user_id, registration_date, status,
created_at, updated_at) VALUES
(1, 5, datetime('now'), 'registered', datetime('now'), datetime('now'));

-- User 6 registered for Event 1
INSERT INTO event_registrations (event_id, user_id, registration_date, status,
created_at, updated_at) VALUES
(1, 6, datetime('now'), 'registered', datetime('now'), datetime('now'));

-- ============================================
-- 5. VERIFY DATA
-- ============================================

-- Check users
SELECT id, name, email, role FROM users ORDER BY id;

-- Check locations
SELECT id, name, is_active FROM locations ORDER BY id;

-- Check events
SELECT id, title, status, event_date, max_attendees, created_by FROM events ORDER BY id;

-- Check registrations
SELECT er.id, e.title, u.name as user_name, er.status
FROM event_registrations er
JOIN events e ON er.event_id = e.id
JOIN users u ON er.user_id = u.id
ORDER BY er.id;

-- ============================================
-- END OF SETUP SCRIPT
-- ============================================
```

### Generate Password Hashes

To generate bcrypt hashes for test passwords, use this Node.js script:

```javascript
const bcrypt = require('bcrypt');

const passwords = {
  'SuperAdmin123!': '',
  'Admin123!': '',
  'Approver123!': '',
  'User123!': '',
  'John123!': '',
  'Jane123!': ''
};

async function generateHashes() {
  for (const [password, _] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}\n`);
  }
}

generateHashes();
```

Or use the API endpoint to create users:

```bash
# Login as superadmin first
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@campus-event-hub.local","password":"SuperAdmin123!"}'

# Use the token to create test users
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"Admin123!","role":"admin"}'
```

---

## API Testing Collection

### Postman/Thunder Client Collection Structure

```
Campus Event Hub API Tests
├── Auth
│   ├── Login - Valid
│   ├── Login - Invalid Password
│   ├── Login - Invalid Email
│   ├── Get Profile
│   └── Update Profile
├── Users
│   ├── List Users (Admin)
│   ├── List Users (User - Forbidden)
│   ├── Create User (Admin)
│   ├── Create User (Duplicate Email)
│   ├── Get User by ID
│   ├── Update User
│   └── Delete User
├── Events
│   ├── List Published Events
│   ├── Create Event (User)
│   ├── Create Event (Invalid Data)
│   ├── Get Event by ID
│   ├── Update Event
│   ├── Delete Event
│   ├── Submit for Approval
│   ├── Approve Event
│   ├── Request Revision
│   └── Publish Event
├── Event Registration
│   ├── Register for Event
│   ├── Register Twice (Conflict)
│   ├── Unregister from Event
│   ├── Get Registrations
│   └── Get Event Stats
├── Locations
│   ├── List Active Locations
│   ├── List All Locations
│   ├── Create Location
│   ├── Update Location
│   ├── Toggle Location Status
│   └── Delete Location
└── Settings
    ├── Get Settings
    ├── Update Settings (Superadmin)
    ├── Update Settings (Admin - Forbidden)
    └── Upload Logo
```

---

## Environment Variables

### Development Environment

```env
# API Base URL
BASE_URL=http://localhost:3000/api/v1

# Test User Tokens (update after login)
SUPERADMIN_TOKEN=your_superadmin_token_here
ADMIN_TOKEN=your_admin_token_here
APPROVER_TOKEN=your_approver_token_here
USER_TOKEN=your_user_token_here

# Test User IDs
SUPERADMIN_ID=1
ADMIN_ID=2
APPROVER_ID=3
USER_ID=4

# Test Event IDs
PUBLISHED_EVENT_ID=1
DRAFT_EVENT_ID=2
PENDING_EVENT_ID=4

# Test Location IDs
LOCATION_ACTIVE_ID=1
LOCATION_INACTIVE_ID=5
```

---

## Quick Reference Commands

### Database Queries

```sql
-- Get all users with roles
SELECT id, name, email, role FROM users;

-- Get all events with status
SELECT id, title, status, event_date, created_by FROM events;

-- Get event with full details
SELECT e.*, l.name as location_name, u.name as creator_name
FROM events e
JOIN locations l ON e.location_id = l.id
JOIN users u ON e.created_by = u.id
WHERE e.id = 1;

-- Get event registrations count
SELECT e.title, COUNT(er.id) as total_registered
FROM events e
LEFT JOIN event_registrations er ON e.event_id = er.id
WHERE er.status = 'registered'
GROUP BY e.id;

-- Get user's registered events
SELECT e.*, er.status, er.registration_date
FROM events e
JOIN event_registrations er ON e.id = er.event_id
WHERE er.user_id = 4;
```

### API Testing with curl

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"User123!"}'

# Get Events (with token)
curl -X GET http://localhost:3000/api/v1/events \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Event
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Event",
    "description": "Test Description",
    "eventDate": "2025-12-31",
    "eventTime": "14:00",
    "registrationStartDate": "2025-11-01",
    "registrationStartTime": "09:00",
    "registrationEndDate": "2025-12-30",
    "registrationEndTime": "17:00",
    "locationId": 1,
    "maxAttendees": 100
  }'

# Register for Event
curl -X POST http://localhost:3000/api/v1/events/1/register \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

### Important Reminders

1. **Password Hashing**: All passwords in the database must be bcrypt hashed. Don't insert plain text passwords.

2. **Token Expiration**: JWT tokens expire after 24 hours by default. Re-login if you get 401 errors.

3. **Database Resets**: After running the setup script, you may need to restart the server to clear any cached data.

4. **Foreign Key Constraints**: Always delete child records before parent records:
   - Delete event_registrations before events
   - Delete events before locations or users

5. **Date/Time Formats**: Always use ISO 8601 formats:
   - Date: `YYYY-MM-DD`
   - Time: `HH:MM`
   - DateTime: `YYYY-MM-DDTHH:MM:SS.sssZ`

6. **Test Isolation**: Each test should be independent. Clean up test data after each test or use unique test data.

7. **Concurrent Testing**: Be careful with race conditions when testing event registrations at max capacity.

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-06
**Maintained By:** Test Team

---

*This test data reference is companion to TEST_SCRIPT.md*
