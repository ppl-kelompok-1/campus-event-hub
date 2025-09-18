# Campus Event Hub

A monorepo project for managing campus events, built with TypeScript and modern web technologies.

## 🏗️ Project Structure

This project uses a monorepo structure managed by PNPM workspaces:

```
campus-event-hub/
├── packages/
│   └── server/          # Express.js backend API
├── pnpm-workspace.yaml  # PNPM workspace configuration
├── package.json         # Root package configuration
└── tsconfig.json        # Root TypeScript configuration
```

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **PNPM**: v8.0.0 or higher

Install PNPM globally if you haven't already:
```bash
npm install -g pnpm
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-event-hub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file in the server package
   cp packages/server/.env.example packages/server/.env
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file in packages/server
   cd packages/server
   cat > .env << EOF
   PORT=3000
   NODE_ENV=development
   DATABASE_PATH=./data/app.db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=24h
   EOF
   ```

5. **Initialize the database and create SUPERADMIN**
   ```bash
   # This creates the SQLite database and first SUPERADMIN user
   pnpm run init-superadmin
   ```

6. **Start the development server**
   ```bash
   # From the root directory
   cd packages/server
   pnpm dev
   
   # Or from any directory
   pnpm --filter @campus-event-hub/server dev
   ```

   The server will start at `http://localhost:3000`

## 📜 Available Scripts

### Root Level Scripts

- `pnpm format` - Format all TypeScript files across all packages
- `pnpm build` - Build all packages in the workspace
- `pnpm -r <script>` - Run a script in all packages that have it

### Server Package Scripts

Navigate to `packages/server` or use `pnpm --filter @campus-event-hub/server <script>`:

- `pnpm dev` - Start the development server with hot reload
- `pnpm build` - Build the TypeScript project
- `pnpm start` - Run the production server
- `pnpm format` - Format code using Prettier

### Database Setup

The server uses SQLite by default. The database file is created automatically on first run.

1. **Default location**: `./packages/data/app.db` (relative to packages/server)
2. **Configuration**: Set `DATABASE_PATH` in your `.env` file
3. **Initialization**: Run `pnpm run init-superadmin` to create database and first user
4. **Migrations**: Run automatically on server startup
5. **In-memory DB**: Set `DATABASE_PATH=:memory:` for testing
6. **Git Ignored**: Database files are automatically ignored by git for security

**Important**: The database directory (`packages/data/`) is excluded from git to prevent:
- Accidental commit of user data
- Environment-specific data conflicts
- Security issues with production data

## 🛠️ Development

### Adding New Packages

1. Create a new directory under `packages/`
2. Initialize with `pnpm init`
3. Add the package name with `@campus-event-hub/` prefix
4. Install dependencies using `pnpm add`

### Code Style

- TypeScript strict mode is enabled
- Prettier is configured for consistent formatting
- Run `pnpm format` before committing

### TypeScript Configuration

- Root `tsconfig.json` provides base configuration
- Each package can extend and customize as needed
- Strict type checking is enabled

## 🔌 API Documentation

### Server Endpoints

The server provides the following endpoints:

#### Basic Endpoints
- `GET /` - Welcome message
- `GET /health` - Server health check
- `GET /api/v1` - API information with available endpoints

#### Authentication Endpoints
- `POST /api/v1/auth/register` - Register a new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Returns: User object with JWT token
- `POST /api/v1/auth/login` - Login existing user
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: User object with JWT token
- `GET /api/v1/auth/profile` - Get current user profile (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Current user profile
- `PUT /api/v1/auth/profile` - Update current user profile (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "string", "email": "string", "currentPassword": "string", "newPassword": "string" }` (all fields optional)

#### User Management Endpoints (Admin/Superadmin only)
- `GET /api/v1/users` - List all users with pagination (requires Admin/Superadmin role)
  - Query params: `?page=1&limit=10`
  - Headers: `Authorization: Bearer <token>`
- `GET /api/v1/users/:id` - Get a specific user by ID (role-based access)
  - Headers: `Authorization: Bearer <token>`
- `POST /api/v1/users` - Create a new user (Admin/Superadmin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "string", "email": "string", "password": "string", "role": "USER|ADMIN" }`
- `PUT /api/v1/users/:id` - Update an existing user (role-based access)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "string", "email": "string", "role": "USER|ADMIN" }` (all fields optional)
- `DELETE /api/v1/users/:id` - Delete a user (Admin/Superadmin only)
  - Headers: `Authorization: Bearer <token>`

### User Roles & Permissions

The system implements role-based access control (RBAC) with three user roles:

- **USER** - Default role for registered users
  - Can view own profile
  - Can update own profile
- **ADMIN** - Administrative privileges
  - All USER permissions
  - Can view all users
  - Can create, update, and delete users
  - Cannot manage SUPERADMIN users
- **SUPERADMIN** - System administrator (highest privilege)
  - All ADMIN permissions
  - Can manage ADMIN users
  - Can assign/revoke roles

### Database Architecture

The server uses a clean architecture with repository pattern:

- **SQLite Database** with raw SQL queries (easily replaceable)
- **Repository Pattern** for data access abstraction
- **Service Layer** for business logic
- **Dependency Injection** for loose coupling
- **JWT Authentication** with role-based authorization

#### Architecture Layers:
```
src/
├── models/           # Domain models (User, Auth)
├── repositories/     # Abstract interfaces (IUserRepository)
├── infrastructure/   # Concrete implementations
│   ├── database/     # Database connection & migrations
│   └── repositories/ # SQLite repository implementations
├── services/         # Business logic (UserService, AuthService)
├── middleware/       # Auth, error handling, validation
└── routes/           # REST API endpoints
```

### Error Handling

All errors are handled consistently with:
- Proper HTTP status codes
- JSON error responses
- Custom AppError class for application errors
- Async error wrapper for route handlers
- Stack traces in development mode

### Example API Usage

#### Authentication Flow

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }'

# Login user
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepassword123"
  }'

# Response includes JWT token:
# {
#   "success": true,
#   "data": {
#     "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "USER" },
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }

# Get current user profile (requires authentication)
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Update profile
curl -X PUT http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "currentPassword": "securepassword123",
    "newPassword": "newsecurepassword456"
  }'
```

#### User Management (Admin only)

```bash
# Get all users (Admin/Superadmin only)
curl -X GET http://localhost:3000/api/v1/users?page=1&limit=10 \
  -H "Authorization: Bearer <admin-token>"

# Create a user as admin
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "admin@example.com",
    "password": "adminpassword123",
    "role": "ADMIN"
  }'

# Update user role (Superadmin only)
curl -X PUT http://localhost:3000/api/v1/users/2 \
  -H "Authorization: Bearer <superadmin-token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'

# Delete a user (Admin/Superadmin only)
curl -X DELETE http://localhost:3000/api/v1/users/2 \
  -H "Authorization: Bearer <admin-token>"
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm format` to ensure code style
4. Test your changes thoroughly
5. Submit a pull request

### Development Guidelines

- Write clean, self-documenting code
- Add TypeScript types for all functions and variables
- Follow the existing project structure
- Update documentation as needed

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Built with Express.js and TypeScript
- Package management by PNPM
- Development tooling by Nodemon and ts-node