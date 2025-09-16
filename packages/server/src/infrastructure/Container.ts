import { IDatabase } from './database/IDatabase';
import { SQLiteDatabase } from './database/SQLiteDatabase';
import { IUserRepository } from '../repositories/IUserRepository';
import { SQLiteUserRepository } from './repositories/SQLiteUserRepository';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { MigrationRunner } from './database/MigrationRunner';
import path from 'path';

// Simple dependency injection container
export class Container {
  private static instance: Container;
  private database?: IDatabase;
  private userRepository?: IUserRepository;
  private userService?: UserService;
  private authService?: AuthService;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Database instance (singleton)
  getDatabase(): IDatabase {
    if (!this.database) {
      const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/app.db');
      this.database = new SQLiteDatabase(dbPath);
      
      // Run migrations
      const migrationRunner = new MigrationRunner(this.database);
      const migrationsPath = path.join(__dirname, 'database/migrations');
      migrationRunner.runMigrations(migrationsPath);
    }
    return this.database;
  }

  // User repository (singleton)
  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new SQLiteUserRepository(this.getDatabase());
    }
    return this.userRepository;
  }

  // Auth service (singleton)
  getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService(this.getUserRepository());
    }
    return this.authService;
  }

  // User service (singleton)
  getUserService(): UserService {
    if (!this.userService) {
      this.userService = new UserService(this.getUserRepository(), this.getAuthService());
    }
    return this.userService;
  }

  // Method to close database connection
  async close(): Promise<void> {
    if (this.database) {
      this.database.close();
    }
  }

  // Reset container (useful for testing)
  reset(): void {
    if (this.database) {
      this.database.close();
    }
    this.database = undefined;
    this.userRepository = undefined;
    this.userService = undefined;
    this.authService = undefined;
  }
}

// Export singleton instance
export const container = Container.getInstance();