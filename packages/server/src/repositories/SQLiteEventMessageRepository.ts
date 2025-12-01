import { IDatabase } from '../infrastructure/database/IDatabase';
import { IEventMessageRepository } from './IEventMessageRepository';
import { EventMessage, CreateEventMessageDto } from '../models/EventMessage';

export class SQLiteEventMessageRepository implements IEventMessageRepository {
  constructor(private db: IDatabase) {}

  async create(messageData: CreateEventMessageDto & {
    eventId: number;
    senderId: number;
    recipientCount: number;
  }): Promise<EventMessage> {
    const { eventId, senderId, subject, message, recipientCount } = messageData;

    const query = `
      INSERT INTO event_messages (event_id, sender_id, subject, message, recipient_count)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await this.db.run(query, [eventId, senderId, subject, message, recipientCount]);

    if (!result.lastID) {
      throw new Error('Failed to create event message');
    }

    const created = await this.findById(result.lastID);
    if (!created) {
      throw new Error('Failed to retrieve created message');
    }

    return created;
  }

  async findById(id: number): Promise<EventMessage | null> {
    const query = `
      SELECT id, event_id as eventId, sender_id as senderId,
             subject, message, recipient_count as recipientCount,
             sent_at as sentAt, created_at as createdAt
      FROM event_messages
      WHERE id = ?
    `;

    const row = await this.db.get(query, [id]) as any;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      eventId: row.eventId,
      senderId: row.senderId,
      subject: row.subject,
      message: row.message,
      recipientCount: row.recipientCount,
      sentAt: new Date(row.sentAt),
      createdAt: new Date(row.createdAt)
    };
  }

  async findByEventId(eventId: number): Promise<EventMessage[]> {
    const query = `
      SELECT id, event_id as eventId, sender_id as senderId,
             subject, message, recipient_count as recipientCount,
             sent_at as sentAt, created_at as createdAt
      FROM event_messages
      WHERE event_id = ?
      ORDER BY sent_at DESC
    `;

    const rows = await this.db.all(query, [eventId]) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId,
      senderId: row.senderId,
      subject: row.subject,
      message: row.message,
      recipientCount: row.recipientCount,
      sentAt: new Date(row.sentAt),
      createdAt: new Date(row.createdAt)
    }));
  }

  async findBySenderId(senderId: number): Promise<EventMessage[]> {
    const query = `
      SELECT id, event_id as eventId, sender_id as senderId,
             subject, message, recipient_count as recipientCount,
             sent_at as sentAt, created_at as createdAt
      FROM event_messages
      WHERE sender_id = ?
      ORDER BY sent_at DESC
    `;

    const rows = await this.db.all(query, [senderId]) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId,
      senderId: row.senderId,
      subject: row.subject,
      message: row.message,
      recipientCount: row.recipientCount,
      sentAt: new Date(row.sentAt),
      createdAt: new Date(row.createdAt)
    }));
  }

  async countByEventId(eventId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM event_messages
      WHERE event_id = ?
    `;

    const row = await this.db.get(query, [eventId]) as any;
    return row?.count || 0;
  }

  async getEventTitle(eventId: number): Promise<string | null> {
    const query = `
      SELECT title
      FROM events
      WHERE id = ?
    `;

    const row = await this.db.get(query, [eventId]) as any;
    return row?.title || null;
  }

  async getSenderName(senderId: number): Promise<string | null> {
    const query = `
      SELECT name
      FROM users
      WHERE id = ?
    `;

    const row = await this.db.get(query, [senderId]) as any;
    return row?.name || null;
  }
}
