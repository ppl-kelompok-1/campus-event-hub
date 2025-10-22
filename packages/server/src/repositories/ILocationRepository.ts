import { Location, CreateLocationDto, UpdateLocationDto } from '../models/Location';

export interface ILocationRepository {
  // Create operations
  create(locationData: CreateLocationDto): Promise<Location>;

  // Read operations
  findById(id: number): Promise<Location | null>;
  findAll(): Promise<Location[]>;
  findActive(): Promise<Location[]>;
  findByName(name: string): Promise<Location | null>;
  findPaginated(page: number, limit: number): Promise<{
    locations: Location[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  // Update operations
  update(id: number, locationData: UpdateLocationDto): Promise<Location | null>;
  updateStatus(id: number, isActive: boolean): Promise<boolean>;

  // Delete operations
  delete(id: number): Promise<boolean>;

  // Utility operations
  exists(id: number): Promise<boolean>;
  countActive(): Promise<number>;
}
