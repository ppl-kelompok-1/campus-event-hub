import { IDatabase } from '../database/IDatabase';
import { IEventRepository } from '../../repositories/IEventRepository';
import { Event, CreateEventDto, UpdateEventDto, EventStatus } from '../../models/Event';

export class SQLiteEventRepository implements IEventRepository {
  constructor(private database: IDatabase) {}

  async create(eventData: CreateEventDto, createdBy: number): Promise<Event> {
    const query = `
      INSERT INTO events (title, description, event_date, event_time, event_end_date, event_end_time, location_id, max_attendees, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const status = eventData.status || EventStatus.DRAFT;
    const params = [
      eventData.title,
      eventData.description || null,
      eventData.eventDate,
      eventData.eventTime,
      eventData.eventEndDate || null,
      eventData.eventEndTime,
      eventData.locationId,
      eventData.maxAttendees || null,
      createdBy,
      status
    ];

    const result = await this.database.run(query, params);
    const eventId = result.lastID;

    if (!eventId) {
      throw new Error('Failed to create event');
    }

    const createdEvent = await this.findById(eventId);
    if (!createdEvent) {
      throw new Error('Failed to retrieve created event');
    }

    return createdEvent;
  }

  async findById(id: number): Promise<Event | null> {
    const query = `
      SELECT * FROM events WHERE id = ?
    `;
    const row = await this.database.get(query, [id]);
    
    return row ? this.mapRowToEvent(row) : null;
  }

  async findAll(): Promise<Event[]> {
    const query = `
      SELECT * FROM events ORDER BY created_at DESC
    `;
    const rows = await this.database.all(query);
    
    return rows.map((row: any) => this.mapRowToEvent(row));
  }

  async findByCreator(createdBy: number): Promise<Event[]> {
    const query = `
      SELECT * FROM events WHERE created_by = ? ORDER BY created_at DESC
    `;
    const rows = await this.database.all(query, [createdBy]);
    
    return rows.map((row: any) => this.mapRowToEvent(row));
  }

  async findByStatus(status: EventStatus): Promise<Event[]> {
    const query = `
      SELECT * FROM events WHERE status = ? ORDER BY event_date ASC, event_time ASC
    `;
    const rows = await this.database.all(query, [status]);
    
    return rows.map((row: any) => this.mapRowToEvent(row));
  }

  async findPublishedEvents(): Promise<Event[]> {
    return this.findByStatus(EventStatus.PUBLISHED);
  }

  async findPaginated(page: number, limit: number, status?: EventStatus): Promise<{
    events: Event[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    
    let countQuery = 'SELECT COUNT(*) as count FROM events';
    let dataQuery = 'SELECT * FROM events';
    const params: any[] = [];

    if (status) {
      countQuery += ' WHERE status = ?';
      dataQuery += ' WHERE status = ?';
      params.push(status);
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countResult = await this.database.get(countQuery, status ? [status] : []) as any;
    const total = countResult.count;
    const totalPages = Math.ceil(total / limit);

    const rows = await this.database.all(dataQuery, params);
    const events = rows.map((row: any) => this.mapRowToEvent(row));

    return {
      events,
      total,
      page,
      totalPages
    };
  }

  async update(id: number, eventData: UpdateEventDto): Promise<Event | null> {
    const updates: string[] = [];
    const params: any[] = [];

    if (eventData.title !== undefined) {
      updates.push('title = ?');
      params.push(eventData.title);
    }
    if (eventData.description !== undefined) {
      updates.push('description = ?');
      params.push(eventData.description);
    }
    if (eventData.eventDate !== undefined) {
      updates.push('event_date = ?');
      params.push(eventData.eventDate);
    }
    if (eventData.eventTime !== undefined) {
      updates.push('event_time = ?');
      params.push(eventData.eventTime);
    }
    if (eventData.eventEndDate !== undefined) {
      updates.push('event_end_date = ?');
      params.push(eventData.eventEndDate);
    }
    if (eventData.eventEndTime !== undefined) {
      updates.push('event_end_time = ?');
      params.push(eventData.eventEndTime);
    }
    if (eventData.locationId !== undefined) {
      updates.push('location_id = ?');
      params.push(eventData.locationId);
    }
    if (eventData.maxAttendees !== undefined) {
      updates.push('max_attendees = ?');
      params.push(eventData.maxAttendees);
    }
    if (eventData.status !== undefined) {
      updates.push('status = ?');
      params.push(eventData.status);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = datetime(\'now\')');
    params.push(id);

    const query = `
      UPDATE events SET ${updates.join(', ')} WHERE id = ?
    `;

    await this.database.run(query, params);
    return this.findById(id);
  }

  async updateStatus(id: number, status: EventStatus): Promise<boolean> {
    const query = `
      UPDATE events SET status = ?, updated_at = datetime('now') WHERE id = ?
    `;
    const result = await this.database.run(query, [status, id]);
    return result.changes > 0;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM events WHERE id = ?';
    const result = await this.database.run(query, [id]);
    return result.changes > 0;
  }

  async exists(id: number): Promise<boolean> {
    const query = 'SELECT 1 FROM events WHERE id = ?';
    const result = await this.database.get(query, [id]);
    return !!result;
  }

  async isCreator(eventId: number, userId: number): Promise<boolean> {
    const query = 'SELECT 1 FROM events WHERE id = ? AND created_by = ?';
    const result = await this.database.get(query, [eventId, userId]);
    return !!result;
  }

  async getCreatorName(eventId: number): Promise<string | null> {
    const query = `
      SELECT u.name 
      FROM events e 
      JOIN users u ON e.created_by = u.id 
      WHERE e.id = ?
    `;
    const result = await this.database.get(query, [eventId]) as any;
    return result?.name || null;
  }

  async getApproverName(eventId: number): Promise<string | null> {
    const query = `
      SELECT u.name
      FROM events e
      JOIN users u ON e.approved_by = u.id
      WHERE e.id = ? AND e.approved_by IS NOT NULL
    `;
    const result = await this.database.get(query, [eventId]) as any;
    return result?.name || null;
  }

  async getLocationName(eventId: number): Promise<string | null> {
    const query = `
      SELECT l.name
      FROM events e
      JOIN locations l ON e.location_id = l.id
      WHERE e.id = ?
    `;
    const result = await this.database.get(query, [eventId]) as any;
    return result?.name || null;
  }

  async approveEvent(eventId: number, approverId: number): Promise<boolean> {
    const query = `
      UPDATE events 
      SET status = ?, approved_by = ?, approval_date = datetime('now'), updated_at = datetime('now') 
      WHERE id = ?
    `;
    const result = await this.database.run(query, [EventStatus.PUBLISHED, approverId, eventId]);
    return result.changes > 0;
  }

  async requestRevision(eventId: number, approverId: number, comments: string): Promise<boolean> {
    const query = `
      UPDATE events 
      SET status = ?, revision_comments = ?, approved_by = ?, approval_date = datetime('now'), updated_at = datetime('now') 
      WHERE id = ?
    `;
    const result = await this.database.run(query, [EventStatus.REVISION_REQUESTED, comments, approverId, eventId]);
    return result.changes > 0;
  }

  async submitForApproval(eventId: number): Promise<boolean> {
    const query = `
      UPDATE events 
      SET status = ?, revision_comments = NULL, updated_at = datetime('now') 
      WHERE id = ?
    `;
    const result = await this.database.run(query, [EventStatus.PENDING_APPROVAL, eventId]);
    return result.changes > 0;
  }

  private mapRowToEvent(row: any): Event {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      eventDate: row.event_date,
      eventTime: row.event_time,
      eventEndDate: row.event_end_date,
      eventEndTime: row.event_end_time,
      locationId: row.location_id,
      maxAttendees: row.max_attendees,
      createdBy: row.created_by,
      status: row.status as EventStatus,
      approvedBy: row.approved_by,
      approvalDate: row.approval_date ? new Date(row.approval_date) : undefined,
      revisionComments: row.revision_comments,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}