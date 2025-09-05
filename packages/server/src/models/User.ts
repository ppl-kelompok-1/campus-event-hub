// Domain model for User entity
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new user
export interface CreateUserDto {
  name: string;
  email: string;
}

// DTO for updating a user
export interface UpdateUserDto {
  name?: string;
  email?: string;
}