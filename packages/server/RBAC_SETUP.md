# Role-Based Access Control (RBAC) Setup Guide

## 🔧 Installation

**⚠️ IMPORTANT**: Install the required dependencies first:

```bash
# Install authentication dependencies
pnpm add bcryptjs jsonwebtoken

# Install TypeScript types
pnpm add -D @types/bcryptjs @types/jsonwebtoken
```

## 🏗️ System Overview

The system implements three roles with hierarchical permissions:

### Roles & Permissions

- **superadmin**: 
  - CRUD operations on all users (including admins and other superadmins)
  - Can assign roles: admin, user (cannot create other superadmins via API)
  - Full system access and highest privilege level

- **admin**: 
  - CRUD operations on users (role: user only)
  - Cannot modify superadmins or other admins
  - Can assign role: user only

- **user**: 
  - Update own profile (name, password)
  - View own profile
  - Cannot change their role

## 📡 API Endpoints

### Authentication Routes (`/api/v1/auth`)

```bash
# Register new user (creates user with 'user' role by default)
POST /auth/register
Body: { "name": "string", "email": "string", "password": "string" }

# Login
POST /auth/login  
Body: { "email": "string", "password": "string" }

# Get current user profile
GET /auth/profile
Headers: { "Authorization": "Bearer <token>" }

# Update own profile (users can update name and password only)
PUT /auth/profile
Headers: { "Authorization": "Bearer <token>" }
Body: { "name": "string", "password": "string" }
```

### User Management Routes (`/api/v1/users`)

```bash
# Get all users (Superadmin sees all, Admin sees only users)
GET /users?page=1&limit=10
Headers: { "Authorization": "Bearer <token>" }
Roles: superadmin, admin

# Get user by ID (role-based access control)
GET /users/:id
Headers: { "Authorization": "Bearer <token>" }
Roles: superadmin, admin, user (own profile only)

# Create new user (with role assignment)
POST /users
Headers: { "Authorization": "Bearer <token>" }
Body: { "name": "string", "email": "string", "password": "string", "role": "admin|user" }
Roles: superadmin, admin

# Update user (role-based permissions)
PUT /users/:id
Headers: { "Authorization": "Bearer <token>" }
Body: { "name": "string", "email": "string", "password": "string", "role": "admin|user" }
Roles: superadmin, admin, user (own profile only)

# Delete user (cannot delete self)
DELETE /users/:id
Headers: { "Authorization": "Bearer <token>" }
Roles: superadmin, admin
```

## 🔐 Environment Configuration

Add to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=24h

# Database
DATABASE_PATH=./data/app.db
```

## 🚀 Usage Examples

### 1. Register a user
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

### 3. Create admin user (as superadmin)
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin_token>" \
  -d '{"name": "Admin User", "email": "admin@example.com", "password": "admin123", "role": "admin"}'
```

### 4. Login as SUPERADMIN (first time)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@campus-event-hub.local", "password": "SuperAdmin123!"}'
```

### 5. Update SUPERADMIN password (CRITICAL)
```bash
curl -X PUT http://localhost:3000/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin_token>" \
  -d '{"name": "System Administrator", "password": "YourNewSecurePassword123!"}'
```

### 6. Update own profile (general users)
```bash
curl -X PUT http://localhost:3000/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{"name": "Updated Name", "password": "newpassword123"}'
```

## 🔄 Database Migration

The system includes automatic migration for auth fields. When you start the server, it will:

1. Add `password` and `role` columns to the users table
2. Set default role as 'user' for existing users
3. Create necessary indexes

## 🛡️ Security Features

- **Password Hashing**: Uses bcryptjs with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role Hierarchy**: Enforced at service and middleware levels
- **Input Validation**: Email format, password strength (min 8 chars)
- **SQL Injection Protection**: Parameterized queries
- **Error Handling**: Consistent error responses without sensitive info

## 🏗️ Architecture

The system follows clean architecture principles:

```
src/
├── models/
│   ├── User.ts           # User domain model with roles
│   └── Auth.ts           # Authentication DTOs
├── repositories/
│   └── IUserRepository.ts # Abstract repository interface
├── infrastructure/
│   ├── database/
│   │   └── migrations/
│   │       └── 002_add_auth_fields.sql
│   └── repositories/
│       └── SQLiteUserRepository.ts # SQLite implementation
├── services/
│   ├── AuthService.ts    # JWT & password handling
│   └── UserService.ts    # Role-based business logic
├── middleware/
│   └── auth.ts           # Authentication & authorization
└── routes/
    ├── auth.ts           # Auth endpoints
    └── users.ts          # User CRUD with permissions
```

## 🚀 SUPERADMIN Initialization

**NEW**: Use the automated script to create your first SUPERADMIN user:

```bash
# Run the initialization script
pnpm run init-superadmin
```

### Default SUPERADMIN Credentials

The script creates a SUPERADMIN with these **temporary** credentials:

- **Email**: `superadmin@campus-event-hub.local`
- **Password**: `SuperAdmin123!`
- **Role**: `superadmin`

### 🔐 **CRITICAL SECURITY NOTICE**

⚠️ **CHANGE THE DEFAULT PASSWORD IMMEDIATELY** after first login:

1. **Login** using the default credentials
2. **Update profile** via `/api/v1/auth/profile` with a strong password
3. **Delete or disable** the script after initial setup

### Script Features

- ✅ **Duplicate Prevention**: Won't create multiple SUPERADMINs
- ✅ **Safety Checks**: Validates database state before creation
- ✅ **Secure Hashing**: Uses bcryptjs for password security
- ✅ **Clear Output**: Detailed logging and next steps

## 🎯 Setup Steps (Updated)

1. **Install dependencies** (see Installation section above)
2. **Initialize SUPERADMIN**: `pnpm run init-superadmin`
3. **Start the server**: `pnpm dev`
4. **Login as SUPERADMIN** and **change the default password**
5. **Create admin accounts** through the API
6. **Test role-based permissions**

The database and migrations will run automatically on first startup!

## 🛠️ Troubleshooting

### Script Issues

**Problem**: `pnpm run init-superadmin` fails with database error
```bash
# Solution: Check database path and permissions
ls -la ./data/app.db
# Ensure database directory exists
mkdir -p ./data
```

**Problem**: "SUPERADMIN already exists" but you can't login
```bash
# Check existing SUPERADMINs in database
sqlite3 ./data/app.db "SELECT id, name, email, role, created_at FROM users WHERE role = 'superadmin';"
# Reset password if needed (run script will show existing users)
```

**Problem**: Script runs but server won't start
```bash
# Check environment variables
cat .env
# Ensure JWT_SECRET is set
echo "JWT_SECRET=your-secret-key" >> .env
```

### Authentication Issues

**Problem**: Token expires too quickly
```bash
# Update JWT expiration in .env
JWT_EXPIRE=7d  # or desired duration
```

**Problem**: CORS errors in browser
```bash
# Server includes CORS middleware, check if server is running on correct port
curl http://localhost:3000/health
```

### Permission Issues

**Problem**: Admin can't create users
- ✅ Check the admin has valid JWT token
- ✅ Verify the admin role is correctly assigned
- ✅ Ensure request includes proper Authorization header

**Problem**: User can't update own profile
- ✅ Check JWT token hasn't expired
- ✅ Verify user is updating their own ID
- ✅ Check password complexity requirements (min 8 characters)

### Database Issues

**Problem**: Migration errors on startup
```bash
# Delete database and restart (⚠️ loses all data)
rm ./data/app.db
pnpm run init-superadmin
pnpm dev
```

**Problem**: SQLite database locked
```bash
# Stop all Node processes
pkill -f node
# Restart server
pnpm dev
```