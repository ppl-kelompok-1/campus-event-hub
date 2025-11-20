import { ILocationRepository } from '../repositories/ILocationRepository';
import { Location, CreateLocationDto, UpdateLocationDto, isValidLocationName, isValidMaxCapacity } from '../models/Location';

export class LocationService {
  constructor(private locationRepository: ILocationRepository) {}

  // Create a new location
  async createLocation(locationData: CreateLocationDto): Promise<Location> {
    // Validate input
    this.validateLocationData(locationData);

    // Check if location already exists
    const existingLocation = await this.locationRepository.findByName(locationData.name);
    if (existingLocation) {
      throw new Error(`Location '${locationData.name}' already exists`);
    }

    // Create the location
    const location = await this.locationRepository.create(locationData);
    return location;
  }

  // Get a location by ID
  async getLocationById(id: number): Promise<Location | null> {
    if (id <= 0) {
      throw new Error('Invalid location ID');
    }

    return this.locationRepository.findById(id);
  }

  // Get all locations
  async getAllLocations(): Promise<Location[]> {
    return this.locationRepository.findAll();
  }

  // Get all active locations (for dropdown)
  async getActiveLocations(): Promise<Location[]> {
    return this.locationRepository.findActive();
  }

  // Get locations with pagination
  async getLocationsPaginated(page: number, limit: number): Promise<{
    locations: Location[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (page < 1 || limit < 1) {
      throw new Error('Page and limit must be positive integers');
    }

    return this.locationRepository.findPaginated(page, limit);
  }

  // Update a location
  async updateLocation(id: number, locationData: UpdateLocationDto): Promise<Location | null> {
    // Check if location exists
    const existingLocation = await this.locationRepository.findById(id);
    if (!existingLocation) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Validate input if provided
    if (locationData.name !== undefined) {
      if (!isValidLocationName(locationData.name)) {
        throw new Error('Location name must be non-empty and less than 255 characters');
      }

      // Check if new name already exists (and it's different from current)
      if (locationData.name !== existingLocation.name) {
        const sameNameLocation = await this.locationRepository.findByName(locationData.name);
        if (sameNameLocation) {
          throw new Error(`Location '${locationData.name}' already exists`);
        }
      }
    }

    // Update the location
    const updatedLocation = await this.locationRepository.update(id, locationData);
    if (!updatedLocation) {
      throw new Error('Failed to update location');
    }

    return updatedLocation;
  }

  // Toggle location active/inactive status
  async toggleLocationStatus(id: number): Promise<Location | null> {
    // Check if location exists
    const existingLocation = await this.locationRepository.findById(id);
    if (!existingLocation) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Toggle status
    const success = await this.locationRepository.updateStatus(id, !existingLocation.isActive);
    if (!success) {
      throw new Error('Failed to update location status');
    }

    return this.locationRepository.findById(id);
  }

  // Delete a location
  async deleteLocation(id: number): Promise<boolean> {
    // Check if location exists
    const existingLocation = await this.locationRepository.findById(id);
    if (!existingLocation) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Delete the location
    return this.locationRepository.delete(id);
  }

  // Check if location exists
  async locationExists(id: number): Promise<boolean> {
    return this.locationRepository.exists(id);
  }

  // Get count of active locations
  async getActiveLocationCount(): Promise<number> {
    return this.locationRepository.countActive();
  }

  // Validate location data
  private validateLocationData(locationData: CreateLocationDto): void {
    if (!locationData.name || !isValidLocationName(locationData.name)) {
      throw new Error('Location name must be non-empty and less than 255 characters');
    }

    if (!isValidMaxCapacity(locationData.maxCapacity)) {
      throw new Error('Maximum capacity must be a positive integer');
    }
  }
}
