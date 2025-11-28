import { IUserRepository } from '../repositories/IUserRepository';
import { User, CreateUserDto, UpdateUserDto, UpdateSelfDto, UserRole, UserCategory, UserResponse, PublicUserProfile, toUserResponse, toPublicUserProfile } from '../models/User';
import { AppError } from '../middleware/error';
import { AuthService } from './AuthService';

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private authService: AuthService
  ) {}

  // Get all users (for superadmin) or users of manageable role (for admin)
  async getAllUsers(currentUserRole: UserRole): Promise<UserResponse[]> {
    let users: User[];
    
    if (currentUserRole === UserRole.SUPERADMIN) {
      users = await this.userRepository.findAll();
    } else if (currentUserRole === UserRole.ADMIN) {
      // Admin can only see users with USER role
      users = await this.userRepository.findByRole(UserRole.USER);
    } else {
      throw new AppError('Access denied. Insufficient permissions', 403);
    }
    
    return users.map(toUserResponse);
  }

  async getUserById(id: number, currentUserRole?: UserRole, currentUserId?: number): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if current user can access this user
    if (currentUserRole && currentUserId) {
      this.checkUserAccess(user, currentUserRole, currentUserId);
    }

    return toUserResponse(user);
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async createUser(data: CreateUserDto, currentUserRole: UserRole): Promise<UserResponse> {
    // Validate input
    if (!data.name || !data.email || !data.password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate password
    if (data.password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    // Validate category
    if (!data.category) {
      throw new AppError('Category is required', 400);
    }

    const validCategories = Object.values(UserCategory);
    if (!validCategories.includes(data.category)) {
      throw new AppError(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
    }

    // Check role assignment permissions
    const roleToAssign = data.role || UserRole.USER;
    if (!this.authService.canAssignRole(currentUserRole, roleToAssign)) {
      throw new AppError('Access denied. Cannot assign this role', 403);
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(data.password);
    
    const createData: CreateUserDto = {
      ...data,
      password: hashedPassword,
      role: roleToAssign
    };

    const user = await this.userRepository.create(createData);
    return toUserResponse(user);
  }

  async updateUser(id: number, data: UpdateUserDto, currentUserRole: UserRole, currentUserId: number): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Check permissions to update this user
    this.checkUserAccess(existingUser, currentUserRole, currentUserId);

    // If email is being updated, validate and check uniqueness
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new AppError('Invalid email format', 400);
      }

      const userWithEmail = await this.userRepository.findByEmail(data.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new AppError('Email already in use', 409);
      }
    }

    // Validate password if being updated
    if (data.password) {
      if (data.password.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
      }
      // Hash the new password
      data.password = await this.authService.hashPassword(data.password);
    }

    // Check role assignment permissions
    if (data.role && !this.authService.canAssignRole(currentUserRole, data.role)) {
      throw new AppError('Access denied. Cannot assign this role', 403);
    }

    // Validate category if being updated
    if (data.category !== undefined) {
      const validCategories = Object.values(UserCategory);
      if (!validCategories.includes(data.category)) {
        throw new AppError(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
      }
    }

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) {
      throw new AppError('Failed to update user', 500);
    }

    return toUserResponse(updatedUser);
  }

  // Self-update method for users to update their own profile
  async updateSelf(id: number, data: UpdateSelfDto, currentUserId: number): Promise<UserResponse> {
    if (id !== currentUserId) {
      throw new AppError('Access denied. Can only update your own profile', 403);
    }

    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Validate password if being updated
    if (data.password) {
      if (data.password.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
      }
      // Hash the new password
      data.password = await this.authService.hashPassword(data.password);
    }

    const updateData: UpdateUserDto = {
      name: data.name,
      password: data.password
    };

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new AppError('Failed to update user', 500);
    }

    return toUserResponse(updatedUser);
  }

  async deleteUser(id: number, currentUserRole: UserRole, currentUserId: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check permissions to delete this user
    this.checkUserAccess(user, currentUserRole, currentUserId);

    // Prevent self-deletion
    if (id === currentUserId) {
      throw new AppError('Cannot delete your own account', 400);
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete user', 500);
    }
  }

  async getUsersPaginated(page: number = 1, limit: number = 10, currentUserRole: UserRole): Promise<{
    users: UserResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    let users: User[];
    let total: number;

    if (currentUserRole === UserRole.SUPERADMIN) {
      users = await this.userRepository.findPaginated(limit, offset);
      total = await this.userRepository.count();
    } else if (currentUserRole === UserRole.ADMIN) {
      // Admin can only see users with USER role
      users = await this.userRepository.findPaginatedByRole(UserRole.USER, limit, offset);
      total = await this.userRepository.countByRole(UserRole.USER);
    } else {
      throw new AppError('Access denied. Insufficient permissions', 403);
    }

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(toUserResponse),
      total,
      page,
      totalPages
    };
  }

  // Get users by category (for admins)
  async getUsersByCategory(category: UserCategory, currentUserRole: UserRole): Promise<UserResponse[]> {
    if (currentUserRole !== UserRole.ADMIN && currentUserRole !== UserRole.SUPERADMIN) {
      throw new AppError('Access denied. Insufficient permissions', 403);
    }

    const users = await this.userRepository.findByCategory(category);
    return users.map(toUserResponse);
  }

  // Get public user profile (no authentication required)
  async getPublicUserProfile(id: number): Promise<PublicUserProfile> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return toPublicUserProfile(user);
  }

  // Helper method to check if current user can access target user
  private checkUserAccess(targetUser: User, currentUserRole: UserRole, currentUserId: number): void {
    // Users can always access themselves
    if (targetUser.id === currentUserId) {
      return;
    }

    // Superadmin can access everyone
    if (currentUserRole === UserRole.SUPERADMIN) {
      return;
    }

    // Admin can access users with USER role only
    if (currentUserRole === UserRole.ADMIN && targetUser.role === UserRole.USER) {
      return;
    }

    // Regular users cannot access other users
    throw new AppError('Access denied. Cannot access this user', 403);
  }
}