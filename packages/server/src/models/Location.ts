// Domain model for Location entity
export interface Location {
  id: number;
  name: string;
  maxCapacity?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new location
export interface CreateLocationDto {
  name: string;
  maxCapacity?: number;
}

// DTO for updating a location
export interface UpdateLocationDto {
  name?: string;
  maxCapacity?: number;
  isActive?: boolean;
}

// Validation helpers
export function isValidLocationName(name: string): boolean {
  return Boolean(name && name.trim().length > 0 && name.trim().length <= 255);
}

export function isValidMaxCapacity(capacity: number | undefined): boolean {
  return capacity === undefined || (capacity > 0 && Number.isInteger(capacity));
}
