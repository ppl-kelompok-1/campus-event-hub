import { IDatabase } from '../database/IDatabase';
import { ILocationRepository } from '../../repositories/ILocationRepository';
import { Location, CreateLocationDto, UpdateLocationDto } from '../../models/Location';

export class SQLiteLocationRepository implements ILocationRepository {
  constructor(private database: IDatabase) {}

  async create(locationData: CreateLocationDto): Promise<Location> {
    const query = `
      INSERT INTO locations (name, max_capacity, is_active)
      VALUES (?, ?, ?)
    `;

    const params = [
      locationData.name,
      locationData.maxCapacity || null,
      1 // is_active defaults to true
    ];

    const result = await this.database.run(query, params);
    const locationId = result.lastID;

    if (!locationId) {
      throw new Error('Failed to create location');
    }

    const createdLocation = await this.findById(locationId);
    if (!createdLocation) {
      throw new Error('Failed to retrieve created location');
    }

    return createdLocation;
  }

  async findById(id: number): Promise<Location | null> {
    const query = `
      SELECT * FROM locations WHERE id = ?
    `;
    const row = await this.database.get(query, [id]);

    return row ? this.mapRowToLocation(row) : null;
  }

  async findAll(): Promise<Location[]> {
    const query = `
      SELECT * FROM locations ORDER BY name ASC
    `;
    const rows = await this.database.all(query);

    return rows.map((row: any) => this.mapRowToLocation(row));
  }

  async findActive(): Promise<Location[]> {
    const query = `
      SELECT * FROM locations WHERE is_active = 1 ORDER BY name ASC
    `;
    const rows = await this.database.all(query);

    return rows.map((row: any) => this.mapRowToLocation(row));
  }

  async findByName(name: string): Promise<Location | null> {
    const query = `
      SELECT * FROM locations WHERE name = ?
    `;
    const row = await this.database.get(query, [name]);

    return row ? this.mapRowToLocation(row) : null;
  }

  async findPaginated(page: number, limit: number): Promise<{
    locations: Location[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as count FROM locations`;
    const countResult = await this.database.get(countQuery) as any;
    const total = countResult.count;

    const query = `
      SELECT * FROM locations ORDER BY name ASC LIMIT ? OFFSET ?
    `;
    const rows = await this.database.all(query, [limit, offset]);

    const totalPages = Math.ceil(total / limit);
    const locations = rows.map((row: any) => this.mapRowToLocation(row));

    return {
      locations,
      total,
      page,
      totalPages
    };
  }

  async update(id: number, locationData: UpdateLocationDto): Promise<Location | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (locationData.name !== undefined) {
      fields.push('name = ?');
      values.push(locationData.name);
    }

    if (locationData.maxCapacity !== undefined) {
      fields.push('max_capacity = ?');
      values.push(locationData.maxCapacity || null);
    }

    if (locationData.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(locationData.isActive ? 1 : 0);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = datetime(\'now\')');
    values.push(id);

    const query = `
      UPDATE locations
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    const result = await this.database.run(query, values);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  async updateStatus(id: number, isActive: boolean): Promise<boolean> {
    const query = `
      UPDATE locations
      SET is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    const result = await this.database.run(query, [isActive ? 1 : 0, id]);
    return result.changes > 0;
  }

  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM locations WHERE id = ?
    `;
    const result = await this.database.run(query, [id]);
    return result.changes > 0;
  }

  async exists(id: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM locations WHERE id = ? LIMIT 1
    `;
    const result = await this.database.get(query, [id]);
    return result !== undefined;
  }

  async countActive(): Promise<number> {
    const query = `
      SELECT COUNT(*) as count FROM locations WHERE is_active = 1
    `;
    const result = await this.database.get(query) as any;
    return result.count;
  }

  private mapRowToLocation(row: any): Location {
    return {
      id: row.id,
      name: row.name,
      maxCapacity: row.max_capacity !== null ? row.max_capacity : undefined,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
