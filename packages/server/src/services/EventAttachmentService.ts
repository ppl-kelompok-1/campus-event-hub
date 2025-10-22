import { IEventAttachmentRepository } from '../repositories/IEventAttachmentRepository'
import { IEventRepository } from '../repositories/IEventRepository'
import { IUserRepository } from '../repositories/IUserRepository'
import { EventAttachment, CreateEventAttachmentDto, EventAttachmentResponse } from '../models/EventAttachment'
import { deleteFile, getFilePath } from '../infrastructure/upload/multerConfig'
import { UserRole } from '../models/User'

export class EventAttachmentService {
  constructor(
    private attachmentRepository: IEventAttachmentRepository,
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository
  ) {}

  // Upload a new attachment to an event
  async uploadAttachment(
    eventId: number,
    file: Express.Multer.File,
    uploadedBy: number
  ): Promise<EventAttachmentResponse> {
    // Verify event exists
    const event = await this.eventRepository.findById(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Create attachment record
    const dto: CreateEventAttachmentDto = {
      eventId,
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy
    }

    const attachment = this.attachmentRepository.create(dto)

    // Get uploader name
    const uploader = await this.userRepository.findById(uploadedBy)
    if (!uploader) {
      throw new Error('Uploader not found')
    }

    return this.toAttachmentResponse(attachment, uploader.name)
  }

  // Get all attachments for an event
  async getEventAttachments(eventId: number): Promise<EventAttachmentResponse[]> {
    const attachments = this.attachmentRepository.findByEventId(eventId)

    const responses: EventAttachmentResponse[] = []
    for (const attachment of attachments) {
      const uploader = await this.userRepository.findById(attachment.uploadedBy)
      const uploaderName = uploader ? uploader.name : 'Unknown'
      responses.push(this.toAttachmentResponse(attachment, uploaderName))
    }

    return responses
  }

  // Get a single attachment
  async getAttachment(id: number): Promise<EventAttachmentResponse | null> {
    const attachment = this.attachmentRepository.findById(id)
    if (!attachment) {
      return null
    }

    const uploader = await this.userRepository.findById(attachment.uploadedBy)
    const uploaderName = uploader ? uploader.name : 'Unknown'

    return this.toAttachmentResponse(attachment, uploaderName)
  }

  // Get raw attachment record (for internal use like file downloads)
  async getAttachmentRecord(id: number): Promise<EventAttachment | null> {
    const attachment = this.attachmentRepository.findById(id)
    return attachment || null
  }

  // Delete an attachment
  async deleteAttachment(id: number, userId: number, userRole: UserRole): Promise<boolean> {
    const attachment = this.attachmentRepository.findById(id)
    if (!attachment) {
      throw new Error('Attachment not found')
    }

    // Get the event to check permissions
    const event = await this.eventRepository.findById(attachment.eventId)
    if (!event) {
      throw new Error('Associated event not found')
    }

    // Check permissions:
    // 1. User must be the uploader, OR
    // 2. User must be the event creator, OR
    // 3. User must be admin/superadmin
    const isUploader = attachment.uploadedBy === userId
    const isEventCreator = event.createdBy === userId
    const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN

    if (!isUploader && !isEventCreator && !isAdmin) {
      throw new Error('You do not have permission to delete this attachment')
    }

    // Delete the file from disk
    deleteFile(attachment.filePath)

    // Delete the database record
    return this.attachmentRepository.deleteById(id)
  }

  // Delete all attachments for an event (admin/creator only)
  async deleteEventAttachments(eventId: number, userId: number, userRole: UserRole): Promise<boolean> {
    const event = await this.eventRepository.findById(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Check permissions
    const isEventCreator = event.createdBy === userId
    const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN

    if (!isEventCreator && !isAdmin) {
      throw new Error('You do not have permission to delete these attachments')
    }

    // Get all attachments for the event
    const attachments = this.attachmentRepository.findByEventId(eventId)

    // Delete all files from disk
    for (const attachment of attachments) {
      deleteFile(attachment.filePath)
    }

    // Delete all database records
    return this.attachmentRepository.deleteByEventId(eventId)
  }

  // Helper to convert to response format
  private toAttachmentResponse(attachment: EventAttachment, uploaderName: string): EventAttachmentResponse {
    return {
      id: attachment.id,
      eventId: attachment.eventId,
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      uploadedBy: attachment.uploadedBy,
      uploaderName,
      uploadedAt: attachment.uploadedAt.toISOString(),
      downloadUrl: `/events/${attachment.eventId}/attachments/${attachment.id}/download`
    }
  }
}
