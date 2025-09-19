# API Testing Guide - Campus Event Hub

Complete cURL testing documentation covering all API endpoints with real-world workflows.

## 📋 Prerequisites

### 1. Environment Setup
```bash
# Start the server
cd packages/server
pnpm dev

# Server runs on: http://localhost:3000
```

### 2. Initialize SUPERADMIN
```bash
# Create first SUPERADMIN user
pnpm run init-superadmin

# Default credentials created:
# Email: superadmin@campus-event-hub.local
# Password: SuperAdmin123!
```

### 3. Environment Variables (for testing)
```bash
# Export common variables
export BASE_URL="http://localhost:3000"
export CONTENT_TYPE="Content-Type: application/json"

# Will store tokens as we get them
export USER_TOKEN=""
export ADMIN_TOKEN=""
export SUPERADMIN_TOKEN=""
```

---

## 🚀 Complete Testing Workflow

### Phase 1: Basic Connectivity

#### 1.1 Health Check
```bash
curl -X GET "$BASE_URL/health"
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-09-16T23:35:48.123Z"
}
```

#### 1.2 API Information
```bash
curl -X GET "$BASE_URL/"
```

#### 1.3 API v1 Information
```bash
curl -X GET "$BASE_URL/api/v1"
```

---

### Phase 2: SUPERADMIN Setup & Initial Configuration

> **Note**: In this system, users cannot self-register. All users are created by SUPERADMIN or ADMIN through the `/users` endpoint.

#### 2.1 SUPERADMIN Login
```bash
curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "superadmin@campus-event-hub.local",
    "password": "SuperAdmin123!"
  }'
```

#### 2.2 Store SUPERADMIN Token
```bash
# Copy token from response
export SUPERADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2.3 **CRITICAL**: Change SUPERADMIN Password
```bash
curl -X PUT "$BASE_URL/api/v1/auth/profile" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "name": "System Administrator",
    "password": "NewSecurePassword123!"
  }'
```

#### 2.4 Create Regular User (for testing)
```bash
curl -X POST "$BASE_URL/api/v1/users" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

#### 2.5 Login as Regular User
```bash
curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2.6 Store User Token
```bash
# Copy token from response
export USER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2.7 Get User Profile
```bash
curl -X GET "$BASE_URL/api/v1/auth/profile" \
  -H "Authorization: Bearer $USER_TOKEN"
```

#### 2.8 Update User Profile (Password Change)
```bash
curl -X PUT "$BASE_URL/api/v1/auth/profile" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "name": "John Smith",
    "password": "newpassword123"
  }'
```

---

### Phase 3: Admin User Creation & Management

#### 3.1 Create Admin User (by SUPERADMIN)
```bash
curl -X POST "$BASE_URL/api/v1/users" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "adminpass123",
    "role": "admin"
  }'
```

---

#### 3.2 Admin Login
```bash
curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass123"
  }'
```

#### 3.3 Store Admin Token
```bash
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 3.4 Create Regular User (as Admin)
```bash
curl -X POST "$BASE_URL/api/v1/users" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "janepass123",
    "role": "user"
  }'
```

---

### Phase 4: User Management Operations

#### 4.1 List All Users (SUPERADMIN view)
```bash
curl -X GET "$BASE_URL/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN"
```

#### 4.2 List All Users (ADMIN view)
```bash
# Admin only sees USER role users
curl -X GET "$BASE_URL/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 4.3 Get Specific User by ID
```bash
# Get user with ID 2
curl -X GET "$BASE_URL/api/v1/users/2" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN"
```

#### 4.4 Update User Information
```bash
curl -X PUT "$BASE_URL/api/v1/users/2" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "name": "John Updated",
    "email": "johnupdated@example.com"
  }'
```

#### 4.5 Update User Role (SUPERADMIN only)
```bash
curl -X PUT "$BASE_URL/api/v1/users/2" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

#### 4.6 Delete User
```bash
curl -X DELETE "$BASE_URL/api/v1/users/3" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN"
```

---

## 🛡️ Permission Testing

### Test 1: Unauthorized Access
```bash
# Try to access users without token
curl -X GET "$BASE_URL/api/v1/users"
# Expected: 401 Unauthorized
```

### Test 2: Regular User Accessing Admin Endpoints
```bash
# Try to list users as regular user
curl -X GET "$BASE_URL/api/v1/users" \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 403 Forbidden
```

### Test 3: Admin Trying to Create Another Admin
```bash
# Admin tries to create admin (should fail)
curl -X POST "$BASE_URL/api/v1/users" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Another Admin",
    "email": "admin2@example.com",
    "password": "admin123",
    "role": "admin"
  }'
# Expected: 403 Forbidden
```

### Test 4: Self-Access Only for Regular Users
```bash
# User tries to access another user's profile
curl -X GET "$BASE_URL/api/v1/users/1" \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 403 Forbidden (unless it's their own ID)
```

---

## ❌ Error Testing

### Invalid Authentication
```bash
# Invalid token
curl -X GET "$BASE_URL/api/v1/auth/profile" \
  -H "Authorization: Bearer invalid_token"
```

### Invalid Data Format
```bash
# Missing required fields when creating user
curl -X POST "$BASE_URL/api/v1/users" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "name": "Incomplete User"
  }'
```

### Duplicate Email Creation
```bash
# Try to create user with existing email
curl -X POST "$BASE_URL/api/v1/users" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "name": "Duplicate User",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Invalid Login Credentials
```bash
curl -X POST "$BASE_URL/api/v1/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```

---

## 🔧 Advanced Testing Scenarios

### Scenario 1: Complete User Lifecycle
```bash
#!/bin/bash
# Create user → Login → Update profile → Admin creates → Admin promotes → Delete

# 1. Register
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "$CONTENT_TYPE" \
  -d '{
    "name": "Test Lifecycle",
    "email": "lifecycle@example.com", 
    "password": "password123"
  }')

# Extract user ID and token
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id')
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')

echo "Created user with ID: $USER_ID"

# 2. Update profile
curl -X PUT "$BASE_URL/api/v1/auth/profile" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Lifecycle User"
  }'

# 3. SUPERADMIN promotes to admin
curl -X PUT "$BASE_URL/api/v1/users/$USER_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'

# 4. Delete user
curl -X DELETE "$BASE_URL/api/v1/users/$USER_ID" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN"
```

### Scenario 2: Pagination Testing
```bash
# Create multiple users for pagination testing
for i in {1..15}; do
  curl -X POST "$BASE_URL/api/v1/users" \
    -H "$CONTENT_TYPE" \
    -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
    -d "{
      \"name\": \"Test User $i\",
      \"email\": \"testuser$i@example.com\",
      \"password\": \"password123\",
      \"role\": \"user\"
    }"
done

# Test pagination
curl -X GET "$BASE_URL/api/v1/users?page=1&limit=5" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN"

curl -X GET "$BASE_URL/api/v1/users?page=2&limit=5" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN"
```

---

## 🎯 Quick Test Scripts

### Full System Test (bash script)
```bash
#!/bin/bash
# Save as test_api.sh

set -e  # Exit on any error

echo "🚀 Starting Campus Event Hub API Tests"

# Test health
echo "1. Testing health endpoint..."
curl -f "$BASE_URL/health" > /dev/null
echo "✅ Health check passed"

# Test registration
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "$CONTENT_TYPE" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }')

if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null; then
  echo "✅ Registration successful"
else
  echo "❌ Registration failed"
  exit 1
fi

# Test login
echo "3. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }')

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null; then
  echo "✅ Login successful"
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
else
  echo "❌ Login failed"
  exit 1
fi

# Test profile access
echo "4. Testing profile access..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | jq -e '.success' > /dev/null; then
  echo "✅ Profile access successful"
else
  echo "❌ Profile access failed"
  exit 1
fi

echo "🎉 All tests passed!"
```

---

## 📊 Expected Response Formats

### Success Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

### Pagination Response Format
```json
{
  "success": true,
  "data": [/* array of items */],
  "pagination": {
    "total": 25,
    "page": 1,
    "totalPages": 3,
    "limit": 10
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Error**: `curl: command not found`
- **Solution**: Install curl: `brew install curl` (macOS) or `apt-get install curl` (Linux)

**Error**: `Connection refused`
- **Solution**: Make sure server is running on port 3000: `pnpm dev`

**Error**: `401 Unauthorized`
- **Solution**: Check if token is set correctly: `echo $USER_TOKEN`

**Error**: `Invalid token format`
- **Solution**: Ensure Bearer token format: `Authorization: Bearer <token>`

**Error**: `Token expired`
- **Solution**: Login again to get a fresh token

### Reset Testing Environment
```bash
# Stop server
# Delete database
rm ./data/app.db

# Restart and reinitialize
pnpm run init-superadmin
pnpm dev
```

---

## 📚 Additional Resources

- **README.md** - General project documentation
- **RBAC_SETUP.md** - Detailed role-based access control guide
- **Environment Variables** - Check `.env` file for configuration options
- **Database Schema** - See migration files in `src/infrastructure/database/migrations/`

---

**Happy Testing!** 🎉