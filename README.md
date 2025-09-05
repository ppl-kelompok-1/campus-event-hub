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

4. **Start the development server**
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

1. **Default location**: `./packages/server/data/app.db`
2. **Configuration**: Set `DATABASE_PATH` in your `.env` file
3. **Migrations**: Run automatically on server startup
4. **In-memory DB**: Set `DATABASE_PATH=:memory:` for testing

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

#### User CRUD Endpoints
- `GET /api/v1/users` - List all users with pagination
  - Query params: `?page=1&limit=10`
- `GET /api/v1/users/:id` - Get a specific user by ID
- `POST /api/v1/users` - Create a new user
  - Body: `{ "name": "string", "email": "string" }`
- `PUT /api/v1/users/:id` - Update an existing user
  - Body: `{ "name": "string", "email": "string" }` (all fields optional)
- `DELETE /api/v1/users/:id` - Delete a user

### Database Architecture

The server uses a clean architecture with repository pattern:

- **SQLite Database** with raw SQL queries (easily replaceable)
- **Repository Pattern** for data access abstraction
- **Service Layer** for business logic
- **Dependency Injection** for loose coupling

#### Architecture Layers:
```
src/
├── models/           # Domain models (User)
├── repositories/     # Abstract interfaces (IUserRepository)
├── infrastructure/   # Concrete implementations
│   ├── database/     # Database connection & migrations
│   └── repositories/ # SQLite repository implementations
├── services/         # Business logic (UserService)
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

```bash
# Create a user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com"}'

# Get all users
curl http://localhost:3000/api/v1/users?page=1&limit=10

# Update a user
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith"}'

# Delete a user
curl -X DELETE http://localhost:3000/api/v1/users/1
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