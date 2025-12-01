// Note: This service requires bcryptjs and jsonwebtoken packages
// Run: pnpm add bcryptjs jsonwebtoken
// Run: pnpm add -D @types/bcryptjs @types/jsonwebtoken

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserRepository } from '../repositories/IUserRepository';
import { IDatabase } from '../infrastructure/database/IDatabase';
import { User, UserRole, UserCategory, CreateUserDto } from '../models/User';
import { LoginDto, RegisterDto, JwtPayload, AuthResponse } from '../models/Auth';
import { AppError } from '../middleware/error';

export class AuthService {
  private jwtSecret: string;
  private jwtExpire: string;

  constructor(
    private userRepository: IUserRepository,
    private database?: IDatabase
  ) {
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
      role: UserRole.USER,
      category: UserCategory.MAHASISWA
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

  // Password reset methods
  async generatePasswordResetToken(email: string): Promise<string> {
    if (!this.database) {
      throw new AppError('Database not available', 500);
    }

    // 1. Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // 2. Generate cryptographically secure random token
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    // 3. Calculate expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 4. Delete any existing unused tokens for this user
    this.database.run(
      'DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0',
      [user.id]
    );

    // 5. Insert new token
    this.database.run(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at, used)
       VALUES (?, ?, ?, ?, 0)`,
      [user.id, token, expiresAt.toISOString(), new Date().toISOString()]
    );

    // 6. Return token
    return token;
  }

  async validateResetToken(token: string): Promise<number | null> {
    if (!this.database) {
      throw new AppError('Database not available', 500);
    }

    // 1. Query token from database
    const result = this.database.get(
      `SELECT user_id, expires_at, used
       FROM password_reset_tokens
       WHERE token = ?`,
      [token]
    ) as { user_id: number; expires_at: string; used: number } | undefined;

    // 2. Check if exists
    if (!result) {
      return null;
    }

    // 3. Check if not used
    if (result.used === 1) {
      return null;
    }

    // 4. Check if not expired
    const expiresAt = new Date(result.expires_at);
    const now = new Date();
    if (now > expiresAt) {
      return null;
    }

    // 5. Return userId if valid
    return result.user_id;
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ userId: number; token: string }> {
    if (!this.database) {
      throw new AppError('Database not available', 500);
    }

    // 1. Validate token and get userId
    const userId = await this.validateResetToken(token);
    if (!userId) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // 2. Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // 3. Update user password
    this.database.run(
      'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
      [hashedPassword, new Date().toISOString(), userId]
    );

    // 4. Mark token as used
    this.database.run(
      'UPDATE password_reset_tokens SET used = 1 WHERE token = ?',
      [token]
    );

    // 5. Get user data
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found after password reset', 500);
    }

    // 6. Generate JWT for auto-login
    const jwtToken = this.generateToken(user);

    // 7. Return userId and JWT
    return { userId, token: jwtToken };
  }
}