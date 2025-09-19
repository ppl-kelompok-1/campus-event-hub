import { UserRole } from './User';

// DTO for login request
export interface LoginDto {
  email: string;
  password: string;
}

// DTO for register request
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

// JWT payload interface
export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Auth response interface
export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
  token: string;
}

// Request interface with user info (for authenticated routes)
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: UserRole;
  };
}