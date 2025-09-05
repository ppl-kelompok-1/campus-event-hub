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

- `GET /` - Welcome message
- `GET /health` - Server health check
- `GET /api/v1` - API information

### Error Handling

All errors are handled consistently with:
- Proper HTTP status codes
- JSON error responses
- Stack traces in development mode

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