import { IDatabase } from '../database/IDatabase';
import { IEventApprovalHistoryRepository } from '../../repositories/IEventApprovalHistoryRepository';
import { EventApprovalHistory, CreateEventApprovalHistoryDto } from '../../models/EventApprovalHistory';

export class SQLiteEventApprovalHistoryRepository implements IEventApprovalHistoryRepository {
  constructor(private database: IDatabase) {}

  create(dto: CreateEventApprovalHistoryDto): EventApprovalHistory {
    const stmt = this.database.prepare(`
      INSERT INTO event_approval_history (
        event_id, action, performed_by, performer_name, comments, status_before, status_after
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      dto.eventId,
      dto.action,
      dto.performedBy,
      dto.performerName,
      dto.comments || null,
      dto.statusBefore,
      dto.statusAfter
    );

    const record = this.findById(result.lastInsertRowid as number);
    if (!record) {
      throw new Error('Failed to create approval history record');
    }

    return record;
  }

  findByEventId(eventId: number): EventApprovalHistory[] {
    const stmt = this.database.prepare(`
      SELECT * FROM event_approval_history
      WHERE event_id = ?
      ORDER BY created_at ASC
    `);

    const rows = stmt.all(eventId) as any[];
    return rows.map(this.mapRowToEntity);
  }

  findByPerformer(performerId: number): EventApprovalHistory[] {
    const stmt = this.database.prepare(`
      SELECT * FROM event_approval_history
      WHERE performed_by = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(performerId) as any[];
    return rows.map(this.mapRowToEntity);
  }

  findLatestByEventId(eventId: number): EventApprovalHistory | undefined {
    const stmt = this.database.prepare(`
      SELECT * FROM event_approval_history
      WHERE event_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const row = stmt.get(eventId) as any;
    return row ? this.mapRowToEntity(row) : undefined;
  }

  findById(id: number): EventApprovalHistory | undefined {
    const stmt = this.database.prepare(`
      SELECT * FROM event_approval_history
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    return row ? this.mapRowToEntity(row) : undefined;
  }

  private mapRowToEntity(row: any): EventApprovalHistory {
    return {
      id: row.id,
      eventId: row.event_id,
      action: row.action,
      performedBy: row.performed_by,
      performerName: row.performer_name,
      comments: row.comments,
      statusBefore: row.status_before,
      statusAfter: row.status_after,
      createdAt: new Date(row.created_at)
    };
  }
}
