# Testing Report - Campus Event Hub
## Positive & Negative Test Script

---

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | Campus Event Hub |
| **Website/Application URL** | http://localhost:3000 |
| **API Base URL** | http://localhost:3000/api/v1 |
| **Testing Method** | Positive & Negative Testing |
| **Test Date** | [To be filled during testing] |
| **Tester Name** | [To be filled] |
| **Application Version** | v1.0.0 |
| **Test Environment** | Development/Staging |
| **Database** | SQLite (packages/server/data/app.db) |

---

## Purpose

To ensure that all Campus Event Hub features function correctly with valid input (Positive Testing) and handle invalid input appropriately with proper error messages and status codes (Negative Testing).

---

## Testing Methodology

### Positive Testing
Verifies that the system works correctly with valid input and expected behavior. Tests should confirm:
- Functionality works as intended
- Data is processed correctly
- Proper success responses are returned
- User experience flows smoothly

### Negative Testing
Verifies that the system properly rejects invalid input and displays appropriate error messages. Tests should validate:
- Input validation works correctly
- Error messages are clear and specific
- Proper HTTP status codes are returned (400, 401, 403, 404, 409)
- No unintended side effects occur (no records created, no emails sent)

---

## Test Coverage Summary

| Category | Total Test Cases | Positive | Negative |
|----------|------------------|----------|----------|
| Authentication & Authorization | 10 | 4 | 6 |
| User Management | 12 | 5 | 7 |
| Event Management | 18 | 8 | 10 |
| Event Registration | 10 | 4 | 6 |
| Location Management | 8 | 3 | 5 |
| Site Settings | 6 | 2 | 4 |
| **TOTAL** | **64** | **26** | **38** |

---

## Pre-Test Setup Requirements

### 1. Test User Accounts

Ensure the following test accounts exist in the database:

```sql
-- Superadmin account
INSERT INTO users (name, email, password, role) VALUES
('Super Admin', 'superadmin@campus-event-hub.local', '[bcrypt_hash]', 'superadmin');

-- Admin account
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@test.com', '[bcrypt_hash]', 'admin');

-- Approver account
INSERT INTO users (name, email, password, role) VALUES
('Approver User', 'approver@test.com', '[bcrypt_hash]', 'approver');

-- Regular user account
INSERT INTO users (name, email, password, role) VALUES
('Test User', 'user@test.com', '[bcrypt_hash]', 'user');
```

**Default Test Password**: `Password123!` (minimum 8 characters)

### 2. Test Locations

```sql
-- Create test locations
INSERT INTO locations (name, is_active) VALUES
('Main Auditorium', 1),
('Conference Room A', 1),
('Inactive Location', 0);
```

### 3. Test Events

Create sample events in different statuses for testing:
- Draft event (created by user)
- Published event (for registration testing)
- Pending approval event (for approval workflow testing)
- Event with max attendees (for registration limit testing)

---

# TEST CASES

---

## A. AUTHENTICATION & AUTHORIZATION (10 Test Cases)

---

### Frontend UI Tests

| No | Feature/Function | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|-----------------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 1 | **Login**<br>(TC-LOGIN-001) | ✅ Positive | User logs in with valid email and password | **Email:** `user@test.com`<br>**Password:** `Password123!` | - User is successfully logged in<br>- Redirected to dashboard/home page<br>- User name displayed in header<br>- JWT token stored in browser | **Screenshot:**<br>1. Login form filled with test data<br>2. Dashboard after successful login showing user name<br>3. Browser DevTools → Application → Local Storage showing token | | |
| 2 | **Login**<br>(TC-LOGIN-002) | ❌ Negative | Login with correct email but wrong password | **Email:** `user@test.com`<br>**Password:** `WrongPass123!` | - Login fails<br>- Error message displayed: "Invalid credentials" or similar<br>- User remains on login page<br>- No token stored<br>- HTTP 401 status | **Screenshot:**<br>1. Login form with wrong password<br>2. Error message displayed in red<br>3. Network tab showing 401 response | | |
| 3 | **Login**<br>(TC-LOGIN-003) | ❌ Negative | Login with invalid email format | **Email:** `invalidemail`<br>**Password:** `Password123!` | - Validation error shown<br>- Message: "Please enter a valid email address"<br>- Submit button disabled or validation prevents submission<br>- No API call made | **Screenshot:**<br>1. Form showing invalid email<br>2. Validation error message under email field<br>3. Network tab showing no API request | | |
| 4 | **Login**<br>(TC-LOGIN-004) | ❌ Negative | Login with empty fields | **Email:** `[empty]`<br>**Password:** `[empty]` | - Validation errors for both fields<br>- Message: "Email is required"<br>- Message: "Password is required"<br>- Form not submitted | **Screenshot:**<br>1. Empty login form<br>2. Required field errors displayed<br>3. Submit button state | | |
| 5 | **Login**<br>(TC-LOGIN-005) | ❌ Negative | Login with non-existent email | **Email:** `nonexistent@test.com`<br>**Password:** `Password123!` | - Login fails<br>- Error message: "Invalid credentials"<br>- HTTP 401 status<br>- No token generated | **Screenshot:**<br>1. Login form with non-existent email<br>2. Error message displayed<br>3. Network response showing 401 | | |

---

### Backend API Tests

| No | EndPoint | Method | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|----------|--------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 6 | **/auth/login**<br>(TC-API-LOGIN-001) | POST | ✅ Positive | Login with valid credentials via API | **Body:**<br>```json```<br>{<br>  "email": "user@test.com",<br>  "password": "Password123!"<br>}<br>``` | - HTTP 200 OK<br>- Response contains:<br>  ```json<br>  {<br>    "success": true,<br>    "data": {<br>      "user": {<br>        "id": number,<br>        "name": string,<br>        "email": string,<br>        "role": string<br>      },<br>      "token": "JWT_TOKEN"<br>    }<br>  }<br>  ```<br>- Response time < 1s | **Screenshot:**<br>Use Postman/Thunder Client:<br>1. Request body with test data<br>2. Response showing 200 status<br>3. Response body with user and token | | |
| 7 | **/auth/login**<br>(TC-API-LOGIN-002) | POST | ❌ Negative | Login with wrong password via API | **Body:**<br>```json<br>{<br>  "email": "user@test.com",<br>  "password": "WrongPassword"<br>}<br>``` | - HTTP 401 Unauthorized<br>- Response:<br>  ```json<br>  {<br>    "success": false,<br>    "error": "Invalid credentials"<br>  }<br>  ```<br>- No token returned | **Screenshot:**<br>1. Request with wrong password<br>2. 401 response status<br>3. Error message in response | | |
| 8 | **/auth/profile**<br>(TC-API-PROFILE-001) | GET | ✅ Positive | Get current user profile with valid token | **Headers:**<br>`Authorization: Bearer [VALID_TOKEN]` | - HTTP 200 OK<br>- Response contains user data without password:<br>  ```json<br>  {<br>    "success": true,<br>    "data": {<br>      "id": number,<br>      "name": string,<br>      "email": string,<br>      "role": string,<br>      "createdAt": string<br>    }<br>  }<br>  ``` | **Screenshot:**<br>1. Request with Authorization header<br>2. 200 response<br>3. User data without password field | | |
| 9 | **/auth/profile**<br>(TC-API-PROFILE-002) | GET | ❌ Negative | Get profile without authentication token | **Headers:**<br>`[No Authorization header]` | - HTTP 401 Unauthorized<br>- Error message: "No token provided" or "Authentication required"<br>- No user data returned | **Screenshot:**<br>1. Request without Authorization header<br>2. 401 response<br>3. Error message | | |
| 10 | **/auth/profile**<br>(TC-API-PROFILE-003) | PUT | ❌ Negative | Update profile with password less than 8 characters | **Headers:**<br>`Authorization: Bearer [VALID_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "password": "Pass1"<br>}<br>``` | - HTTP 400 Bad Request<br>- Error: "Password must be at least 8 characters"<br>- Profile not updated | **Screenshot:**<br>1. Request with short password<br>2. 400 response<br>3. Validation error message | | |

---

## B. USER MANAGEMENT (12 Test Cases)

---

### Frontend UI Tests

| No | Feature/Function | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|-----------------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 11 | **Create User**<br>(TC-USER-CREATE-001) | ✅ Positive | Admin creates new user with valid data | **Logged in as:** Admin<br><br>**Name:** `New User`<br>**Email:** `newuser@test.com`<br>**Password:** `Password123!`<br>**Role:** `user` | - User created successfully<br>- Success message displayed<br>- New user appears in users list<br>- User can login with credentials | **Screenshot:**<br>1. Create user form (Admin logged in)<br>2. Success notification<br>3. Users list showing new user<br>4. Successful login as new user | | |
| 12 | **Create User**<br>(TC-USER-CREATE-002) | ❌ Negative | Create user with duplicate email | **Logged in as:** Admin<br><br>**Email:** `user@test.com` (already exists) | - User creation fails<br>- Error message: "Email already exists" or "Email must be unique"<br>- HTTP 409 Conflict<br>- No duplicate user created | **Screenshot:**<br>1. Form with duplicate email<br>2. Error message displayed<br>3. Network tab showing 409 response<br>4. Database check (users list unchanged) | | |
| 13 | **Create User**<br>(TC-USER-CREATE-003) | ❌ Negative | Admin tries to create Superadmin user | **Logged in as:** Admin<br><br>**Role:** `superadmin` | - Action forbidden<br>- Error: "You cannot assign this role" or role dropdown doesn't show superadmin<br>- HTTP 403 Forbidden if API called<br>- No superadmin user created | **Screenshot:**<br>1. Role dropdown showing available roles<br>2. Error message if attempted<br>3. Permission denied notification | | |
| 14 | **Update User**<br>(TC-USER-UPDATE-001) | ✅ Positive | User updates own profile (name) | **Logged in as:** User<br><br>**New Name:** `Updated Name` | - Profile updated successfully<br>- New name displayed in UI<br>- Success message shown<br>- Updated name persists after page refresh | **Screenshot:**<br>1. Profile edit form<br>2. Success notification<br>3. Header showing updated name<br>4. Profile page after refresh | | |
| 15 | **Delete User**<br>(TC-USER-DELETE-001) | ❌ Negative | Admin tries to delete themselves | **Logged in as:** Admin<br><br>**Target:** Current logged-in admin user | - Delete action blocked<br>- Error message: "You cannot delete your own account"<br>- HTTP 400/403<br>- User remains in database | **Screenshot:**<br>1. Users list with current user<br>2. Delete button disabled or error shown<br>3. Error notification<br>4. User still exists in list | | |

---

### Backend API Tests

| No | EndPoint | Method | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|----------|--------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 16 | **/users**<br>(TC-API-USER-LIST-001) | GET | ✅ Positive | Admin retrieves paginated user list | **Headers:**<br>`Authorization: Bearer [ADMIN_TOKEN]`<br><br>**Query:**<br>`?page=1&limit=10` | - HTTP 200 OK<br>- Response:<br>  ```json<br>  {<br>    "success": true,<br>    "data": {<br>      "users": [array],<br>      "pagination": {<br>        "page": 1,<br>        "limit": 10,<br>        "total": number<br>      }<br>    }<br>  }<br>  ```<br>- Users array ≤ 10 items | **Screenshot:**<br>1. Request with Admin token and pagination<br>2. 200 response<br>3. Users array and pagination object | | |
| 17 | **/users**<br>(TC-API-USER-LIST-002) | GET | ❌ Negative | Regular user tries to list all users | **Headers:**<br>`Authorization: Bearer [USER_TOKEN]` | - HTTP 403 Forbidden<br>- Error: "Access denied" or "Insufficient permissions"<br>- No user data returned | **Screenshot:**<br>1. Request with USER role token<br>2. 403 response<br>3. Forbidden error message | | |
| 18 | **/users**<br>(TC-API-USER-CREATE-001) | POST | ✅ Positive | Admin creates user with valid data | **Headers:**<br>`Authorization: Bearer [ADMIN_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "name": "API Test User",<br>  "email": "apitest@test.com",<br>  "password": "SecurePass123!",<br>  "role": "user"<br>}<br>``` | - HTTP 201 Created<br>- Response contains new user (without password)<br>- User can login<br>- User exists in database | **Screenshot:**<br>1. POST request with user data<br>2. 201 response<br>3. Created user object<br>4. Database query showing new user | | |
| 19 | **/users**<br>(TC-API-USER-CREATE-002) | POST | ❌ Negative | Create user with invalid email format | **Headers:**<br>`Authorization: Bearer [ADMIN_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "name": "Test User",<br>  "email": "invalid-email",<br>  "password": "Password123!"<br>}<br>``` | - HTTP 400 Bad Request<br>- Error: "Invalid email format"<br>- No user created | **Screenshot:**<br>1. Request with invalid email<br>2. 400 response<br>3. Validation error details | | |
| 20 | **/users**<br>(TC-API-USER-CREATE-003) | POST | ❌ Negative | Admin tries to create user with superadmin role | **Headers:**<br>`Authorization: Bearer [ADMIN_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "name": "Fake Superadmin",<br>  "email": "fakesuperadmin@test.com",<br>  "password": "Password123!",<br>  "role": "superadmin"<br>}<br>``` | - HTTP 403 Forbidden<br>- Error: "You cannot assign this role"<br>- No superadmin user created<br>- Role hierarchy enforced | **Screenshot:**<br>1. Request with superadmin role<br>2. 403 response<br>3. Permission denied message<br>4. Database check (no new superadmin) | | |
| 21 | **/users/:id**<br>(TC-API-USER-UPDATE-001) | PUT | ❌ Negative | User tries to update another user's profile | **Headers:**<br>`Authorization: Bearer [USER1_TOKEN]`<br><br>**Path:**<br>`/users/[USER2_ID]`<br><br>**Body:**<br>```json<br>{<br>  "name": "Hacked Name"<br>}<br>``` | - HTTP 403 Forbidden<br>- Error: "You can only update your own profile"<br>- Target user's data unchanged | **Screenshot:**<br>1. Request to update different user<br>2. 403 response<br>3. Error message<br>4. Database showing unchanged data | | |
| 22 | **/users/:id**<br>(TC-API-USER-DELETE-001) | DELETE | ❌ Negative | Admin tries to delete self | **Headers:**<br>`Authorization: Bearer [ADMIN_TOKEN]`<br><br>**Path:**<br>`/users/[ADMIN_OWN_ID]` | - HTTP 400 Bad Request<br>- Error: "You cannot delete your own account"<br>- Admin user remains in database | **Screenshot:**<br>1. DELETE request to own user ID<br>2. 400 response<br>3. Error message<br>4. Database check (user still exists) | | |

---

## C. EVENT MANAGEMENT (18 Test Cases)

---

### Frontend UI Tests

| No | Feature/Function | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|-----------------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 23 | **Create Event**<br>(TC-EVENT-CREATE-001) | ✅ Positive | User creates event with valid data | **Logged in as:** User<br><br>**Title:** `Test Event`<br>**Description:** `Test Description`<br>**Event Date:** `2025-12-31`<br>**Event Time:** `14:00`<br>**Reg Start:** `2025-11-01 09:00`<br>**Reg End:** `2025-12-30 17:00`<br>**Location:** `Main Auditorium`<br>**Max Attendees:** `100` | - Event created successfully<br>- Status: "draft"<br>- Success message displayed<br>- Event appears in "My Events"<br>- All data saved correctly | **Screenshot:**<br>1. Create event form filled<br>2. Success notification<br>3. Event in "My Events" with draft status<br>4. Event detail page | | |
| 24 | **Create Event**<br>(TC-EVENT-CREATE-002) | ❌ Negative | Create event with invalid date format | **Event Date:** `31/12/2025` (wrong format)<br>**Expected:** `YYYY-MM-DD` | - Validation error shown<br>- Message: "Date must be in YYYY-MM-DD format"<br>- Form not submitted<br>- No event created | **Screenshot:**<br>1. Form with invalid date<br>2. Validation error under date field<br>3. Submit button state/behavior | | |
| 25 | **Create Event**<br>(TC-EVENT-CREATE-003) | ❌ Negative | Create event with registration end after event date | **Event Date:** `2025-12-31`<br>**Reg End Date:** `2026-01-01` | - Validation error<br>- Message: "Registration must end before event date"<br>- Form submission blocked | **Screenshot:**<br>1. Form showing date conflict<br>2. Error message displayed<br>3. Highlighted error fields | | |
| 26 | **Create Event**<br>(TC-EVENT-CREATE-004) | ❌ Negative | Create event with registration start after registration end | **Reg Start:** `2025-12-01`<br>**Reg End:** `2025-11-30` | - Validation error<br>- Message: "Registration start must be before registration end"<br>- Form not submitted | **Screenshot:**<br>1. Form with date order error<br>2. Validation message<br>3. Form state | | |
| 27 | **Submit for Approval**<br>(TC-EVENT-SUBMIT-001) | ✅ Positive | USER submits draft event for approval | **Logged in as:** User<br>**Event Status:** Draft | - Event status changes to "Pending Approval"<br>- Success message: "Event submitted for approval"<br>- Submit button no longer visible<br>- Event appears in approver's pending list | **Screenshot:**<br>1. Draft event detail page<br>2. Submit for approval button<br>3. Success message<br>4. Updated status showing "Pending Approval"<br>5. Event in approver's queue | | |
| 28 | **Approve Event**<br>(TC-EVENT-APPROVE-001) | ✅ Positive | APPROVER approves pending event | **Logged in as:** Approver<br>**Event Status:** Pending Approval | - Event status changes to "Published"<br>- Event visible on public events page<br>- Approval recorded in history<br>- Creator notified (if applicable) | **Screenshot:**<br>1. Pending approvals list<br>2. Event detail with approve button<br>3. Success notification<br>4. Event now showing "Published"<br>5. Public events page showing event | | |
| 29 | **Approve Event**<br>(TC-EVENT-APPROVE-002) | ❌ Negative | USER tries to approve event | **Logged in as:** User<br>**Event Status:** Pending Approval | - Approve button not visible<br>- If API called directly: 403 Forbidden<br>- Event status unchanged | **Screenshot:**<br>1. Event detail page as USER<br>2. No approve/reject buttons visible<br>3. 403 response if attempted via API | | |
| 30 | **Request Revision**<br>(TC-EVENT-REVISION-001) | ✅ Positive | APPROVER requests revision with comments | **Logged in as:** Approver<br>**Comments:** `Please add more details to description` | - Event status changes to "Revision Requested"<br>- Comments saved and visible to creator<br>- Creator can edit and resubmit<br>- Action logged in approval history | **Screenshot:**<br>1. Request revision form with comments<br>2. Updated status<br>3. Comments visible to creator<br>4. Approval history entry | | |
| 31 | **Publish Event**<br>(TC-EVENT-PUBLISH-001) | ✅ Positive | APPROVER publishes event directly (bypass approval) | **Logged in as:** Approver<br>**Event Status:** Draft (created by approver) | - Event published immediately<br>- Status: "Published"<br>- Visible on public events page<br>- No approval workflow needed | **Screenshot:**<br>1. Create event form with publish option<br>2. Published event<br>3. Public page showing event | | |
| 32 | **Edit Event**<br>(TC-EVENT-EDIT-001) | ✅ Positive | Creator edits own draft event | **Logged in as:** Event Creator<br>**Event Status:** Draft<br>**Update:** Title to `Updated Event Title` | - Event updated successfully<br>- Changes saved and displayed<br>- Status remains "Draft"<br>- Updated timestamp changed | **Screenshot:**<br>1. Edit form with changes<br>2. Success message<br>3. Updated event details<br>4. Updated timestamp | | |
| 33 | **Edit Event**<br>(TC-EVENT-EDIT-002) | ❌ Negative | User tries to edit another user's event | **Logged in as:** User A<br>**Target:** Event created by User B | - Edit button not visible<br>- If accessed directly: 403 Forbidden<br>- Event data unchanged | **Screenshot:**<br>1. Event detail showing no edit button<br>2. 403 error if attempted<br>3. Database unchanged | | |
| 34 | **Delete Event**<br>(TC-EVENT-DELETE-001) | ✅ Positive | Creator deletes own draft event | **Logged in as:** Event Creator<br>**Event Status:** Draft | - Confirmation dialog shown<br>- Event deleted successfully<br>- Removed from "My Events"<br>- No longer in database | **Screenshot:**<br>1. Delete confirmation dialog<br>2. Success message<br>3. Event removed from list<br>4. Database query showing deletion | | |
| 35 | **Cancel Event**<br>(TC-EVENT-CANCEL-001) | ✅ Positive | Creator cancels published event | **Logged in as:** Event Creator<br>**Event Status:** Published | - Event status changes to "Cancelled"<br>- Still visible but marked as cancelled<br>- Registrations preserved<br>- No new registrations allowed | **Screenshot:**<br>1. Cancel confirmation<br>2. Cancelled status displayed<br>3. Event showing cancelled badge<br>4. Registration button disabled | | |

---

### Backend API Tests

| No | EndPoint | Method | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|----------|--------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 36 | **/events**<br>(TC-API-EVENT-CREATE-001) | POST | ✅ Positive | Create event with valid data | **Headers:**<br>`Authorization: Bearer [USER_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "title": "API Test Event",<br>  "description": "Event via API",<br>  "eventDate": "2025-12-31",<br>  "eventTime": "14:00",<br>  "registrationStartDate": "2025-11-01",<br>  "registrationStartTime": "09:00",<br>  "registrationEndDate": "2025-12-30",<br>  "registrationEndTime": "17:00",<br>  "locationId": 1,<br>  "maxAttendees": 100<br>}<br>``` | - HTTP 201 Created<br>- Response contains event object<br>- Status: "draft" (for USER role)<br>- Event saved in database<br>- Response time < 1s | **Screenshot:**<br>1. POST request body<br>2. 201 response<br>3. Event object with generated ID<br>4. Database record | | |
| 37 | **/events**<br>(TC-API-EVENT-CREATE-002) | POST | ❌ Negative | Create event with invalid date format | **Body:**<br>```json<br>{<br>  "title": "Invalid Event",<br>  "eventDate": "31-12-2025",<br>  ...<br>}<br>``` | - HTTP 400 Bad Request<br>- Error: "Event date must be in YYYY-MM-DD format"<br>- No event created | **Screenshot:**<br>1. Request with invalid date<br>2. 400 response<br>3. Validation error details | | |
| 38 | **/events**<br>(TC-API-EVENT-CREATE-003) | POST | ❌ Negative | Create event with non-existent location ID | **Body:**<br>```json<br>{<br>  ...,<br>  "locationId": 99999<br>}<br>``` | - HTTP 400/404<br>- Error: "Location not found"<br>- No event created | **Screenshot:**<br>1. Request with invalid locationId<br>2. Error response<br>3. Error message | | |
| 39 | **/events/:id/submit-for-approval**<br>(TC-API-EVENT-SUBMIT-001) | POST | ✅ Positive | USER submits draft event | **Headers:**<br>`Authorization: Bearer [USER_TOKEN]`<br><br>**Path:**<br>`/events/[DRAFT_EVENT_ID]/submit-for-approval` | - HTTP 200 OK<br>- Event status updated to "pending_approval"<br>- Approval history created<br>- Response confirms submission | **Screenshot:**<br>1. POST request<br>2. 200 response<br>3. Updated event status<br>4. Approval history entry | | |
| 40 | **/events/:id/approve**<br>(TC-API-EVENT-APPROVE-001) | POST | ❌ Negative | USER tries to approve event | **Headers:**<br>`Authorization: Bearer [USER_TOKEN]`<br><br>**Path:**<br>`/events/[PENDING_EVENT_ID]/approve` | - HTTP 403 Forbidden<br>- Error: "Insufficient permissions" or "Only approvers can approve events"<br>- Event status unchanged | **Screenshot:**<br>1. Request with USER token<br>2. 403 response<br>3. Permission denied error<br>4. Event status still pending | | |

---

## D. EVENT REGISTRATION (10 Test Cases)

---

### Frontend UI Tests

| No | Feature/Function | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|-----------------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 41 | **Register for Event**<br>(TC-REG-001) | ✅ Positive | User registers for published event within registration period | **Logged in as:** User<br>**Event:** Published<br>**Current Date:** Within registration period<br>**Available Slots:** > 0 | - Registration successful<br>- Success message displayed<br>- Register button changes to "Unregister"<br>- User appears in attendees list<br>- Registration count increased | **Screenshot:**<br>1. Event detail with Register button<br>2. Success notification<br>3. Button now showing "Unregister"<br>4. User in attendees list<br>5. Updated registration count | | |
| 42 | **Register for Event**<br>(TC-REG-002) | ❌ Negative | User tries to register for event twice | **Logged in as:** User (already registered)<br>**Event:** Same published event | - Registration blocked<br>- Error: "You are already registered for this event"<br>- HTTP 409 Conflict<br>- No duplicate registration | **Screenshot:**<br>1. Event showing "Unregister" button<br>2. Error message if clicked<br>3. Network showing 409 response<br>4. Single registration in database | | |
| 43 | **Register for Event**<br>(TC-REG-003) | ❌ Negative | User tries to register after registration period ended | **Current Date:** After registration end date | - Register button disabled or hidden<br>- Message: "Registration period has ended"<br>- No registration allowed | **Screenshot:**<br>1. Event detail showing expired registration<br>2. Disabled/hidden register button<br>3. Expiry message displayed | | |
| 44 | **Register for Event**<br>(TC-REG-004) | ❌ Negative | User tries to register for event at max capacity | **Max Attendees:** 10<br>**Current Registrations:** 10 | - Registration blocked or added to waitlist<br>- Message: "Event is full" or "Added to waitlist"<br>- Status: "waitlisted" if waitlist enabled<br>- Available slots: 0 | **Screenshot:**<br>1. Event showing full capacity<br>2. Disabled register or waitlist button<br>3. Full/waitlist message<br>4. Registration statistics | | |
| 45 | **Unregister from Event**<br>(TC-REG-UNREG-001) | ✅ Positive | User unregisters from event | **Logged in as:** User (registered)<br>**Event:** Published | - Confirmation dialog shown<br>- Unregistration successful<br>- Button changes back to "Register"<br>- User removed from attendees<br>- Registration count decreased | **Screenshot:**<br>1. Unregister confirmation dialog<br>2. Success message<br>3. Button showing "Register" again<br>4. Updated attendee list<br>5. Decreased count | | |

---

### Backend API Tests

| No | EndPoint | Method | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|----------|--------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 46 | **/events/:id/register**<br>(TC-API-REG-001) | POST | ✅ Positive | Register for published event | **Headers:**<br>`Authorization: Bearer [USER_TOKEN]`<br><br>**Path:**<br>`/events/[PUBLISHED_EVENT_ID]/register` | - HTTP 201 Created<br>- Response:<br>  ```json<br>  {<br>    "success": true,<br>    "data": {<br>      "registration": {<br>        "id": number,<br>        "eventId": number,<br>        "userId": number,<br>        "status": "registered",<br>        "registrationDate": "ISO date"<br>      }<br>    }<br>  }<br>  ```<br>- Registration saved in database | **Screenshot:**<br>1. POST request<br>2. 201 response<br>3. Registration object<br>4. Database record | | |
| 47 | **/events/:id/register**<br>(TC-API-REG-002) | POST | ❌ Negative | Register for draft event (not published) | **Path:**<br>`/events/[DRAFT_EVENT_ID]/register` | - HTTP 400 Bad Request<br>- Error: "Event is not published" or "Cannot register for this event"<br>- No registration created | **Screenshot:**<br>1. Request to draft event<br>2. 400 response<br>3. Error message<br>4. No database record | | |
| 48 | **/events/:id/register**<br>(TC-API-REG-003) | POST | ❌ Negative | Register twice for same event | **Prerequisites:** User already registered<br><br>**Path:**<br>`/events/[EVENT_ID]/register` | - HTTP 409 Conflict<br>- Error: "You are already registered for this event"<br>- No duplicate registration | **Screenshot:**<br>1. Second registration attempt<br>2. 409 response<br>3. Conflict error message<br>4. Single registration in database | | |
| 49 | **/events/:id/register**<br>(TC-API-REG-004) | POST | ❌ Negative | Register without authentication | **Headers:**<br>`[No Authorization header]`<br><br>**Path:**<br>`/events/[EVENT_ID]/register` | - HTTP 401 Unauthorized<br>- Error: "Authentication required"<br>- No registration created | **Screenshot:**<br>1. Request without token<br>2. 401 response<br>3. Auth error message | | |
| 50 | **/events/:id/register**<br>(TC-API-REG-005) | DELETE | ✅ Positive | Unregister from event | **Headers:**<br>`Authorization: Bearer [USER_TOKEN]`<br><br>**Path:**<br>`/events/[EVENT_ID]/register`<br><br>**Prerequisites:** User is registered | - HTTP 200 OK<br>- Success message<br>- Registration removed from database<br>- Registration status may be updated to "cancelled" | **Screenshot:**<br>1. DELETE request<br>2. 200 response<br>3. Success message<br>4. Database showing removal/cancellation | | |

---

## E. LOCATION MANAGEMENT (8 Test Cases)

---

### Frontend UI Tests

| No | Feature/Function | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|-----------------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 51 | **Create Location**<br>(TC-LOC-CREATE-001) | ✅ Positive | Admin creates new location | **Logged in as:** Admin<br><br>**Name:** `Conference Room B` | - Location created successfully<br>- Success message shown<br>- Location appears in locations list<br>- Available in event creation dropdown | **Screenshot:**<br>1. Create location form<br>2. Success notification<br>3. Location in list<br>4. Location in event form dropdown | | |
| 52 | **Create Location**<br>(TC-LOC-CREATE-002) | ❌ Negative | Create location with duplicate name | **Name:** `Main Auditorium` (already exists) | - Creation fails<br>- Error: "Location name already exists"<br>- HTTP 409 Conflict<br>- No duplicate created | **Screenshot:**<br>1. Form with duplicate name<br>2. Error message<br>3. 409 response in network tab<br>4. Locations list unchanged | | |
| 53 | **Create Location**<br>(TC-LOC-CREATE-003) | ❌ Negative | Regular user tries to create location | **Logged in as:** User | - Create location page/button not accessible<br>- If attempted: HTTP 403 Forbidden<br>- No location created | **Screenshot:**<br>1. UI showing no create option for user<br>2. 403 error if attempted<br>3. Permission denied message | | |
| 54 | **Toggle Location**<br>(TC-LOC-TOGGLE-001) | ✅ Positive | Admin toggles location status (active ↔ inactive) | **Logged in as:** Admin<br>**Location:** Active location | - Status toggled successfully<br>- Inactive locations don't appear in event form dropdowns<br>- Still visible in admin locations list<br>- Toggle button updates | **Screenshot:**<br>1. Location with toggle button<br>2. Success message<br>3. Updated status indicator<br>4. Event form showing only active locations | | |

---

### Backend API Tests

| No | EndPoint | Method | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|----------|--------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 55 | **/locations/active**<br>(TC-API-LOC-LIST-001) | GET | ✅ Positive | Get active locations (public access) | **Headers:**<br>`[No auth required]` | - HTTP 200 OK<br>- Response contains only locations with `isActive: true`<br>- Array of location objects | **Screenshot:**<br>1. GET request without auth<br>2. 200 response<br>3. Active locations array<br>4. All have isActive: true | | |
| 56 | **/locations**<br>(TC-API-LOC-CREATE-001) | POST | ✅ Positive | Admin creates location | **Headers:**<br>`Authorization: Bearer [ADMIN_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "name": "API Test Location"<br>}<br>``` | - HTTP 201 Created<br>- Response contains location object with generated ID<br>- Location in database<br>- Default `isActive: true` | **Screenshot:**<br>1. POST request with admin token<br>2. 201 response<br>3. Created location object<br>4. Database record | | |
| 57 | **/locations**<br>(TC-API-LOC-CREATE-002) | POST | ❌ Negative | User tries to create location | **Headers:**<br>`Authorization: Bearer [USER_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "name": "Unauthorized Location"<br>}<br>``` | - HTTP 403 Forbidden<br>- Error: "Access denied" or "Admin privileges required"<br>- No location created | **Screenshot:**<br>1. Request with user token<br>2. 403 response<br>3. Permission error<br>4. No database record | | |
| 58 | **/locations/:id**<br>(TC-API-LOC-DELETE-001) | DELETE | ❌ Negative | Delete location used by events | **Headers:**<br>`Authorization: Bearer [ADMIN_TOKEN]`<br><br>**Path:**<br>`/locations/[LOCATION_IN_USE_ID]` | - HTTP 400 Bad Request<br>- Error: "Cannot delete location that is used by events"<br>- Location remains in database<br>- Referential integrity preserved | **Screenshot:**<br>1. DELETE request<br>2. 400 response<br>3. Error message about existing references<br>4. Location still exists in database | | |

---

## F. SITE SETTINGS (6 Test Cases)

---

### Frontend UI Tests

| No | Feature/Function | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|-----------------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 59 | **Update Settings**<br>(TC-SETTINGS-001) | ✅ Positive | Superadmin updates site title and colors | **Logged in as:** Superadmin<br><br>**Site Title:** `My Campus Events`<br>**Primary Color:** `#FF5733`<br>**Secondary Color:** `#33FF57` | - Settings updated successfully<br>- Changes reflect immediately in UI<br>- New title in header/navbar<br>- Colors applied to theme<br>- Updated timestamp recorded | **Screenshot:**<br>1. Settings form with changes<br>2. Success notification<br>3. Updated UI showing new title<br>4. Theme with new colors<br>5. Settings page after refresh | | |
| 60 | **Update Settings**<br>(TC-SETTINGS-002) | ❌ Negative | Admin tries to update settings | **Logged in as:** Admin | - Settings page not accessible or read-only<br>- If attempted: HTTP 403 Forbidden<br>- Settings unchanged | **Screenshot:**<br>1. UI showing no access or read-only view<br>2. 403 error if attempted<br>3. Permission denied message | | |
| 61 | **Upload Logo**<br>(TC-SETTINGS-LOGO-001) | ✅ Positive | Superadmin uploads site logo | **Logged in as:** Superadmin<br>**File:** Valid image (PNG/JPG) < 5MB | - Logo uploaded successfully<br>- Logo displayed in header/navbar<br>- File saved to server<br>- Logo URL updated in settings | **Screenshot:**<br>1. Logo upload form<br>2. Success message<br>3. Logo displayed in header<br>4. Settings showing logo URL | | |

---

### Backend API Tests

| No | EndPoint | Method | Test Type | Test Scenario | Test Data | Expected Result | Screenshot Instructions | Actual Result | Status |
|----|----------|--------|-----------|---------------|-----------|-----------------|------------------------|---------------|--------|
| 62 | **/settings**<br>(TC-API-SETTINGS-001) | GET | ✅ Positive | Get site settings (public access) | **Headers:**<br>`[No auth required]` | - HTTP 200 OK<br>- Response contains all settings:<br>  ```json<br>  {<br>    "success": true,<br>    "data": {<br>      "siteTitle": string,<br>      "primaryColor": string,<br>      "secondaryColor": string,<br>      ...<br>    }<br>  }<br>  ``` | **Screenshot:**<br>1. GET request without auth<br>2. 200 response<br>3. Complete settings object | | |
| 63 | **/settings**<br>(TC-API-SETTINGS-002) | PUT | ✅ Positive | Superadmin updates settings | **Headers:**<br>`Authorization: Bearer [SUPERADMIN_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "siteTitle": "Updated Title",<br>  "primaryColor": "#007bff"<br>}<br>``` | - HTTP 200 OK<br>- Settings updated in database<br>- Response contains updated settings<br>- Updated timestamp changed | **Screenshot:**<br>1. PUT request with updates<br>2. 200 response<br>3. Updated settings object<br>4. Database reflecting changes | | |
| 64 | **/settings**<br>(TC-API-SETTINGS-003) | PUT | ❌ Negative | Admin tries to update settings | **Headers:**<br>`Authorization: Bearer [ADMIN_TOKEN]`<br><br>**Body:**<br>```json<br>{<br>  "siteTitle": "Hacked Title"<br>}<br>``` | - HTTP 403 Forbidden<br>- Error: "Only superadmin can update settings"<br>- Settings unchanged | **Screenshot:**<br>1. Request with admin token<br>2. 403 response<br>3. Permission error<br>4. Settings unchanged in database | | |

---

## TEST EXECUTION SUMMARY

### Completion Tracking

| Test Execution Date | Tester Name | Passed | Failed | Blocked | Pass Rate |
|---------------------|-------------|--------|--------|---------|-----------|
| [Date] | [Name] | 0 | 0 | 0 | 0% |

### Test Results by Category

| Category | Total | Passed | Failed | Blocked | Pass % |
|----------|-------|--------|--------|---------|--------|
| Authentication & Authorization | 10 | 0 | 0 | 0 | 0% |
| User Management | 12 | 0 | 0 | 0 | 0% |
| Event Management | 18 | 0 | 0 | 0 | 0% |
| Event Registration | 10 | 0 | 0 | 0 | 0% |
| Location Management | 8 | 0 | 0 | 0 | 0% |
| Site Settings | 6 | 0 | 0 | 0 | 0% |
| **TOTAL** | **64** | **0** | **0** | **0** | **0%** |

---

## DEFECTS FOUND

| Defect ID | Test Case | Severity | Description | Steps to Reproduce | Expected | Actual | Status |
|-----------|-----------|----------|-------------|-------------------|----------|--------|--------|
| DEF-001 | | | | | | | |

**Severity Levels:**
- **Critical**: System crash, data loss, security vulnerability
- **High**: Major feature broken, significant functionality impacted
- **Medium**: Feature partially works, workaround available
- **Low**: Minor issue, cosmetic problem

---

## NOTES & OBSERVATIONS

### Testing Environment Issues
- [Document any environment setup issues]
- [Database state problems]
- [Network/connectivity issues]

### Test Data Issues
- [Any problems with test accounts]
- [Data conflicts or inconsistencies]

### Application Behavior
- [Unexpected behaviors observed]
- [Performance issues noted]
- [Usability concerns]

### Recommendations
- [Suggestions for improvement]
- [Additional test cases needed]
- [Automation opportunities]

---

## APPENDIX

### A. Test Data Reference

See [TEST_DATA.md](./TEST_DATA.md) for complete test data sets including:
- User credentials for all roles
- Sample event data
- Location test data
- Boundary values
- Invalid input examples

### B. API Testing Tools

Recommended tools for API testing:
- **Postman**: Full-featured API testing
- **Thunder Client**: VS Code extension
- **curl**: Command-line testing
- **Insomnia**: Alternative API client

### C. Browser DevTools Tips

**Network Tab:**
- Filter by XHR to see API calls
- Check status codes
- Inspect request/response headers and body

**Console Tab:**
- Look for JavaScript errors
- Check authentication token

**Application Tab:**
- View Local Storage for JWT token
- Check cookies if used

**Elements Tab:**
- Inspect form validation messages
- Check CSS classes for error states

### D. Screenshot Checklist

For each failed test:
1. ✅ Screenshot of the action being performed
2. ✅ Error message clearly visible
3. ✅ Network tab showing status code
4. ✅ Database state (if applicable)
5. ✅ Console errors (if any)

---

## APPROVAL & SIGN-OFF

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tester | | | |
| QA Lead | | | |
| Project Manager | | | |

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-06
**Next Review Date:** [To be filled]

---

*This test script follows the format and best practices from Software Project Week 8-10 Testing Script requirements.*
