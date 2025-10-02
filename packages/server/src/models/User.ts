// Role enum for user roles
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  APPROVER = 'approver',
  USER = 'user'
}

// Domain model for User entity
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// User without password for API responses
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new user
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole; // Optional, defaults to USER
}

// DTO for updating a user
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

// DTO for user self-update (limited fields)
export interface UpdateSelfDto {
  name?: string;
  password?: string;
}

// Public user profile (excludes email for privacy)
export interface PublicUserProfile {
  id: number;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// Helper function to convert User to UserResponse
export function toUserResponse(user: User): UserResponse {
  const { password, ...userResponse } = user;
  return userResponse;
}

// Helper function to convert User to PublicUserProfile
export function toPublicUserProfile(user: User): PublicUserProfile {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}