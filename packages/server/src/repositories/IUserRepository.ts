import { User, CreateUserDto, UpdateUserDto, UserRole } from '../models/User';

// Abstract repository interface - no database-specific code
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  findByRole(role: UserRole): Promise<User[]>;
  create(user: CreateUserDto): Promise<User>;
  update(id: number, user: UpdateUserDto): Promise<User | undefined>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
  countByRole(role: UserRole): Promise<number>;
  findPaginated(limit: number, offset: number): Promise<User[]>;
  findPaginatedByRole(role: UserRole, limit: number, offset: number): Promise<User[]>;
}