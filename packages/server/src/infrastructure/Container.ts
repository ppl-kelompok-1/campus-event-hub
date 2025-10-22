import { IDatabase } from './database/IDatabase';
import { SQLiteDatabase } from './database/SQLiteDatabase';
import { IUserRepository } from '../repositories/IUserRepository';
import { IEventRepository } from '../repositories/IEventRepository';
import { IEventRegistrationRepository } from '../repositories/IEventRegistrationRepository';
import { ILocationRepository } from '../repositories/ILocationRepository';
import { SQLiteUserRepository } from './repositories/SQLiteUserRepository';
import { SQLiteEventRepository } from './repositories/SQLiteEventRepository';
import { SQLiteEventRegistrationRepository } from '../repositories/SQLiteEventRegistrationRepository';
import { SQLiteLocationRepository } from './repositories/SQLiteLocationRepository';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { EventService } from '../services/EventService';
import { EventRegistrationService } from '../services/EventRegistrationService';
import { LocationService } from '../services/LocationService';
import { MigrationRunner } from './database/MigrationRunner';
import path from 'path';

// Simple dependency injection container
export class Container {
  private static instance: Container;
  private database?: IDatabase;
  private userRepository?: IUserRepository;
  private eventRepository?: IEventRepository;
  private eventRegistrationRepository?: IEventRegistrationRepository;
  private locationRepository?: ILocationRepository;
  private userService?: UserService;
  private authService?: AuthService;
  private eventService?: EventService;
  private eventRegistrationService?: EventRegistrationService;
  private locationService?: LocationService;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Database instance (singleton)
  getDatabase(options?: { silent?: boolean }): IDatabase {
    if (!this.database) {
      const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/app.db');
      this.database = new SQLiteDatabase(dbPath);
      
      // Run migrations
      const migrationRunner = new MigrationRunner(this.database);
      const migrationsPath = path.join(__dirname, 'database/migrations');
      migrationRunner.runMigrations(migrationsPath, { silent: options?.silent });
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

  // Event registration repository (singleton)
  getEventRegistrationRepository(): IEventRegistrationRepository {
    if (!this.eventRegistrationRepository) {
      this.eventRegistrationRepository = new SQLiteEventRegistrationRepository(this.getDatabase());
    }
    return this.eventRegistrationRepository;
  }

  // Location repository (singleton)
  getLocationRepository(): ILocationRepository {
    if (!this.locationRepository) {
      this.locationRepository = new SQLiteLocationRepository(this.getDatabase());
    }
    return this.locationRepository;
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
      this.eventService = new EventService(
        this.getEventRepository(),
        this.getUserRepository(),
        this.getLocationRepository(),
        this.getEventRegistrationRepository()
      );
    }
    return this.eventService;
  }

  // Event registration service (singleton)
  getEventRegistrationService(): EventRegistrationService {
    if (!this.eventRegistrationService) {
      this.eventRegistrationService = new EventRegistrationService(
        this.getEventRegistrationRepository(),
        this.getEventRepository()
      );
    }
    return this.eventRegistrationService;
  }

  // Location service (singleton)
  getLocationService(): LocationService {
    if (!this.locationService) {
      this.locationService = new LocationService(this.getLocationRepository());
    }
    return this.locationService;
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
    this.eventRegistrationRepository = undefined;
    this.locationRepository = undefined;
    this.userService = undefined;
    this.authService = undefined;
    this.eventService = undefined;
    this.eventRegistrationService = undefined;
    this.locationService = undefined;
  }
}

// Export singleton instance
export const container = Container.getInstance();