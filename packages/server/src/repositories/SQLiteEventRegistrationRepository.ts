import { IDatabase } from '../infrastructure/database/IDatabase';
import { IEventRegistrationRepository } from './IEventRegistrationRepository';
import { EventRegistration, CreateRegistrationDto, UpdateRegistrationDto, RegistrationStatus } from '../models/EventRegistration';

export class SQLiteEventRegistrationRepository implements IEventRegistrationRepository {
  constructor(private db: IDatabase) {}

  async create(registrationData: CreateRegistrationDto): Promise<EventRegistration> {
    const { eventId, userId, status = RegistrationStatus.REGISTERED } = registrationData;
    
    const query = `
      INSERT INTO event_registrations (event_id, user_id, status)
      VALUES (?, ?, ?)
    `;
    
    const result = await this.db.run(query, [eventId, userId, status]);
    
    if (!result.lastID) {
      throw new Error('Failed to create event registration');
    }
    
    const created = await this.findById(result.lastID);
    if (!created) {
      throw new Error('Failed to retrieve created registration');
    }
    
    return created;
  }

  async findById(id: number): Promise<EventRegistration | null> {
    const query = `
      SELECT id, event_id as eventId, user_id as userId, 
             registration_date as registrationDate, status,
             created_at as createdAt, updated_at as updatedAt
      FROM event_registrations 
      WHERE id = ?
    `;
    
    const row = await this.db.get(query, [id]) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      registrationDate: new Date(row.registrationDate),
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  async findByEventAndUser(eventId: number, userId: number): Promise<EventRegistration | null> {
    const query = `
      SELECT id, event_id as eventId, user_id as userId, 
             registration_date as registrationDate, status,
             created_at as createdAt, updated_at as updatedAt
      FROM event_registrations 
      WHERE event_id = ? AND user_id = ?
    `;
    
    const row = await this.db.get(query, [eventId, userId]) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      registrationDate: new Date(row.registrationDate),
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  async findByEventId(eventId: number): Promise<EventRegistration[]> {
    const query = `
      SELECT id, event_id as eventId, user_id as userId, 
             registration_date as registrationDate, status,
             created_at as createdAt, updated_at as updatedAt
      FROM event_registrations 
      WHERE event_id = ?
      ORDER BY registration_date ASC
    `;
    
    const rows = await this.db.all(query, [eventId]) as any[];
    
    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      registrationDate: new Date(row.registrationDate),
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  async findByUserId(userId: number): Promise<EventRegistration[]> {
    const query = `
      SELECT id, event_id as eventId, user_id as userId, 
             registration_date as registrationDate, status,
             created_at as createdAt, updated_at as updatedAt
      FROM event_registrations 
      WHERE user_id = ?
      ORDER BY registration_date DESC
    `;
    
    const rows = await this.db.all(query, [userId]) as any[];
    
    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      registrationDate: new Date(row.registrationDate),
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  async update(id: number, updateData: UpdateRegistrationDto): Promise<EventRegistration | null> {
    const setParts: string[] = [];
    const values: any[] = [];
    
    if (updateData.status !== undefined) {
      setParts.push('status = ?');
      values.push(updateData.status);
    }
    
    if (setParts.length === 0) {
      throw new Error('No update data provided');
    }
    
    setParts.push('updated_at = datetime("now")');
    values.push(id);
    
    const query = `
      UPDATE event_registrations 
      SET ${setParts.join(', ')}
      WHERE id = ?
    `;
    
    await this.db.run(query, values);
    
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM event_registrations WHERE id = ?';
    const result = await this.db.run(query, [id]);
    return result.changes > 0;
  }

  async deleteByEventAndUser(eventId: number, userId: number): Promise<boolean> {
    const query = 'DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?';
    const result = await this.db.run(query, [eventId, userId]);
    return result.changes > 0;
  }

  async getRegistrationCountByStatus(eventId: number, status: RegistrationStatus): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM event_registrations 
      WHERE event_id = ? AND status = ?
    `;
    
    const row = await this.db.get(query, [eventId, status]) as any;
    return row?.count || 0;
  }

  async getActiveRegistrationCount(eventId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM event_registrations 
      WHERE event_id = ? AND status IN (?, ?)
    `;
    
    const row = await this.db.get(query, [eventId, RegistrationStatus.REGISTERED, RegistrationStatus.WAITLISTED]) as any;
    return row?.count || 0;
  }

  async getEventRegistrationStats(eventId: number): Promise<{
    totalRegistered: number;
    totalWaitlisted: number;
    totalCancelled: number;
  }> {
    const query = `
      SELECT 
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as totalRegistered,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as totalWaitlisted,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as totalCancelled
      FROM event_registrations 
      WHERE event_id = ?
    `;
    
    const row = await this.db.get(query, [
      RegistrationStatus.REGISTERED,
      RegistrationStatus.WAITLISTED,
      RegistrationStatus.CANCELLED,
      eventId
    ]) as any;
    
    return {
      totalRegistered: row?.totalRegistered || 0,
      totalWaitlisted: row?.totalWaitlisted || 0,
      totalCancelled: row?.totalCancelled || 0
    };
  }

  async getUserName(userId: number): Promise<string | null> {
    const query = 'SELECT name FROM users WHERE id = ?';
    const row = await this.db.get(query, [userId]) as any;
    return row?.name || null;
  }

  async getUserEmail(userId: number): Promise<string | null> {
    const query = 'SELECT email FROM users WHERE id = ?';
    const row = await this.db.get(query, [userId]) as any;
    return row?.email || null;
  }

  async isUserRegistered(eventId: number, userId: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM event_registrations 
      WHERE event_id = ? AND user_id = ?
    `;
    
    const row = await this.db.get(query, [eventId, userId]) as any;
    return (row?.count || 0) > 0;
  }

  async hasActiveRegistration(eventId: number, userId: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM event_registrations 
      WHERE event_id = ? AND user_id = ? AND status IN (?, ?)
    `;
    
    const row = await this.db.get(query, [eventId, userId, RegistrationStatus.REGISTERED, RegistrationStatus.WAITLISTED]) as any;
    return (row?.count || 0) > 0;
  }
}