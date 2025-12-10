import { IDatabase } from '../infrastructure/database/IDatabase';
import { IReminderLogRepository, ReminderLog, ReminderType } from './IReminderLogRepository';

export class SQLiteReminderLogRepository implements IReminderLogRepository {
  constructor(private db: IDatabase) {}

  async createLog(eventId: number, userId: number | null, reminderType: ReminderType): Promise<void> {
    const query = `
      INSERT INTO reminder_logs (event_id, user_id, reminder_type)
      VALUES (?, ?, ?)
    `;

    await this.db.run(query, [eventId, userId, reminderType]);
  }

  async hasReminderBeenSent(eventId: number, userId: number | null, reminderType: ReminderType): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM reminder_logs
      WHERE event_id = ? AND user_id IS ? AND reminder_type = ?
    `;

    const row = await this.db.get(query, [eventId, userId, reminderType]) as any;
    return row.count > 0;
  }

  async getReminderLogs(eventId: number): Promise<ReminderLog[]> {
    const query = `
      SELECT id, event_id as eventId, user_id as userId,
             reminder_type as reminderType, sent_at as sentAt,
             created_at as createdAt
      FROM reminder_logs
      WHERE event_id = ?
      ORDER BY sent_at DESC
    `;

    const rows = await this.db.all(query, [eventId]) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      reminderType: row.reminderType as ReminderType,
      sentAt: new Date(row.sentAt),
      createdAt: new Date(row.createdAt)
    }));
  }
}
