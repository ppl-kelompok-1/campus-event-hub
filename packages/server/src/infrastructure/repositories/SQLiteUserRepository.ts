import { IUserRepository } from '../../repositories/IUserRepository';
import { User, CreateUserDto, UpdateUserDto } from '../../models/User';
import { IDatabase } from '../database/IDatabase';

export class SQLiteUserRepository implements IUserRepository {
  constructor(private db: IDatabase) {}

  async findAll(): Promise<User[]> {
    const sql = `
      SELECT id, name, email, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    const rows = this.db.query<any>(sql);
    return rows.map(this.mapToUser);
  }

  async findById(id: number): Promise<User | undefined> {
    const sql = `
      SELECT id, name, email, created_at, updated_at 
      FROM users 
      WHERE id = ?
    `;
    
    const row = this.db.get<any>(sql, [id]);
    return row ? this.mapToUser(row) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const sql = `
      SELECT id, name, email, created_at, updated_at 
      FROM users 
      WHERE email = ?
    `;
    
    const row = this.db.get<any>(sql, [email]);
    return row ? this.mapToUser(row) : undefined;
  }

  async create(user: CreateUserDto): Promise<User> {
    const sql = `
      INSERT INTO users (name, email, created_at, updated_at) 
      VALUES (?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = this.db.run(sql, [user.name, user.email]);
    const newUser = await this.findById(Number(result.lastInsertRowid));
    
    if (!newUser) {
      throw new Error('Failed to create user');
    }
    
    return newUser;
  }

  async update(id: number, user: UpdateUserDto): Promise<User | undefined> {
    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const params: any[] = [];
    
    if (user.name !== undefined) {
      updates.push('name = ?');
      params.push(user.name);
    }
    
    if (user.email !== undefined) {
      updates.push('email = ?');
      params.push(user.email);
    }
    
    if (updates.length === 0) {
      return await this.findById(id);
    }
    
    // Always update updated_at
    updates.push("updated_at = datetime('now')");
    params.push(id);
    
    const sql = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `;
    
    const result = this.db.run(sql, params);
    
    if (result.changes === 0) {
      return undefined;
    }
    
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = this.db.run(sql, [id]);
    return result.changes > 0;
  }

  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM users';
    const result = this.db.get<{ count: number }>(sql);
    return result?.count || 0;
  }

  async findPaginated(limit: number, offset: number): Promise<User[]> {
    const sql = `
      SELECT id, name, email, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const rows = this.db.query<any>(sql, [limit, offset]);
    return rows.map(this.mapToUser);
  }

  // Helper method to map database rows to User model
  private mapToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}