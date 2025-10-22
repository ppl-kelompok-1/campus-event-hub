import { EventAttachment, CreateEventAttachmentDto } from '../models/EventAttachment'

export interface IEventAttachmentRepository {
  // Create a new attachment
  create(dto: CreateEventAttachmentDto): EventAttachment

  // Get attachment by ID
  findById(id: number): EventAttachment | undefined

  // Get all attachments for an event
  findByEventId(eventId: number): EventAttachment[]

  // Delete an attachment
  deleteById(id: number): boolean

  // Delete all attachments for an event
  deleteByEventId(eventId: number): boolean

  // Check if user owns the attachment (uploaded it)
  isUploadedBy(attachmentId: number, userId: number): boolean
}
