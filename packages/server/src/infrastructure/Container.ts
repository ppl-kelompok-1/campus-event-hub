import { IDatabase } from './database/IDatabase';
import { SQLiteDatabase } from './database/SQLiteDatabase';
import { IUserRepository } from '../repositories/IUserRepository';
import { IEventRepository } from '../repositories/IEventRepository';
import { SQLiteUserRepository } from './repositories/SQLiteUserRepository';
import { SQLiteEventRepository } from './repositories/SQLiteEventRepository';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { EventService } from '../services/EventService';
import { MigrationRunner } from './database/MigrationRunner';
import path from 'path';

// Simple dependency injection container
export class Container {
  private static instance: Container;
  private database?: IDatabase;
  private userRepository?: IUserRepository;
  private eventRepository?: IEventRepository;
  private userService?: UserService;
  private authService?: AuthService;
  private eventService?: EventService;

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

  // Event repository (singleton)
  getEventRepository(): IEventRepository {
    if (!this.eventRepository) {
      this.eventRepository = new SQLiteEventRepository(this.getDatabase());
    }
    return this.eventRepository;
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

  // Event service (singleton)
  getEventService(): EventService {
    if (!this.eventService) {
      this.eventService = new EventService(this.getEventRepository(), this.getUserRepository());
    }
    return this.eventService;
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
    this.eventRepository = undefined;
    this.userService = undefined;
    this.authService = undefined;
    this.eventService = undefined;
  }
}

// Export singleton instance
export const container = Container.getInstance();