// Domain model for Location entity
export interface Location {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new location
export interface CreateLocationDto {
  name: string;
}

// DTO for updating a location
export interface UpdateLocationDto {
  name?: string;
  isActive?: boolean;
}

// Validation helpers
export function isValidLocationName(name: string): boolean {
  return Boolean(name && name.trim().length > 0 && name.trim().length <= 255);
}
