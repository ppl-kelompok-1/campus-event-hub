import { IUserRepository } from '../repositories/IUserRepository';
import { User, CreateUserDto, UpdateUserDto } from '../models/User';
import { AppError } from '../middleware/error';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    // Validate input
    if (!data.name || !data.email) {
      throw new AppError('Name and email are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    return await this.userRepository.create(data);
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

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

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) {
      throw new AppError('Failed to update user', 500);
    }

    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete user', 500);
    }
  }

  async getUsersPaginated(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const users = await this.userRepository.findPaginated(limit, offset);
    const total = await this.userRepository.count();
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages
    };
  }
}