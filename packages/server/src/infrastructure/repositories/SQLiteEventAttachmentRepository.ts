import { IDatabase } from '../database/IDatabase'
import { IEventAttachmentRepository } from '../../repositories/IEventAttachmentRepository'
import { EventAttachment, CreateEventAttachmentDto } from '../../models/EventAttachment'

export class SQLiteEventAttachmentRepository implements IEventAttachmentRepository {
  constructor(private database: IDatabase) {}

  create(dto: CreateEventAttachmentDto): EventAttachment {
    const query = `
      INSERT INTO event_attachments (
        event_id, file_name, original_name, file_path,
        file_size, mime_type, uploaded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      dto.eventId,
      dto.fileName,
      dto.originalName,
      dto.filePath,
      dto.fileSize,
      dto.mimeType,
      dto.uploadedBy
    ]

    const result = this.database.prepare(query).run(...params)
    const attachmentId = result.lastInsertRowid as number

    if (!attachmentId) {
      throw new Error('Failed to create event attachment')
    }

    const attachment = this.findById(attachmentId)
    if (!attachment) {
      throw new Error('Failed to retrieve created attachment')
    }

    return attachment
  }

  findById(id: number): EventAttachment | undefined {
    const query = `
      SELECT * FROM event_attachments WHERE id = ?
    `
    const row = this.database.prepare(query).get(id)

    return row ? this.mapRowToAttachment(row as any) : undefined
  }

  findByEventId(eventId: number): EventAttachment[] {
    const query = `
      SELECT * FROM event_attachments
      WHERE event_id = ?
      ORDER BY uploaded_at DESC
    `
    const rows = this.database.prepare(query).all(eventId)

    return rows.map((row: any) => this.mapRowToAttachment(row))
  }

  deleteById(id: number): boolean {
    const query = `DELETE FROM event_attachments WHERE id = ?`
    const result = this.database.prepare(query).run(id)

    return result.changes > 0
  }

  deleteByEventId(eventId: number): boolean {
    const query = `DELETE FROM event_attachments WHERE event_id = ?`
    const result = this.database.prepare(query).run(eventId)

    return result.changes > 0
  }

  isUploadedBy(attachmentId: number, userId: number): boolean {
    const query = `
      SELECT COUNT(*) as count
      FROM event_attachments
      WHERE id = ? AND uploaded_by = ?
    `
    const row = this.database.prepare(query).get(attachmentId, userId) as { count: number }

    return row.count > 0
  }

  private mapRowToAttachment(row: any): EventAttachment {
    return {
      id: row.id,
      eventId: row.event_id,
      fileName: row.file_name,
      originalName: row.original_name,
      filePath: row.file_path,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      uploadedBy: row.uploaded_by,
      uploadedAt: new Date(row.uploaded_at)
    }
  }
}
