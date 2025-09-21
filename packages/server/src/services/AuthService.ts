// Note: This service requires bcryptjs and jsonwebtoken packages
// Run: pnpm add bcryptjs jsonwebtoken
// Run: pnpm add -D @types/bcryptjs @types/jsonwebtoken

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserRepository } from '../repositories/IUserRepository';
import { User, UserRole, CreateUserDto } from '../models/User';
import { LoginDto, RegisterDto, JwtPayload, AuthResponse } from '../models/Auth';
import { AppError } from '../middleware/error';

export class AuthService {
  private jwtSecret: string;
  private jwtExpire: string;

  constructor(private userRepository: IUserRepository) {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtExpire = process.env.JWT_EXPIRE || '24h';
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    // Validate input
    this.validatePassword(data.password);
    this.validateEmail(data.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user with default role
    const createUserDto: CreateUserDto = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: UserRole.USER
    };

    const user = await this.userRepository.create(createUserDto);
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpire } as SignOptions);
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }
  }

  // Role hierarchy check
  canManageRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.SUPERADMIN]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.APPROVER]: 2,
      [UserRole.USER]: 1
    };

    return roleHierarchy[currentUserRole] > roleHierarchy[targetRole];
  }

  // Check if user can assign specific role
  canAssignRole(currentUserRole: UserRole, roleToAssign: UserRole): boolean {
    switch (currentUserRole) {
      case UserRole.SUPERADMIN:
        return roleToAssign === UserRole.ADMIN || roleToAssign === UserRole.APPROVER || roleToAssign === UserRole.USER;
      case UserRole.ADMIN:
        return roleToAssign === UserRole.APPROVER || roleToAssign === UserRole.USER;
      default:
        return false;
    }
  }
}