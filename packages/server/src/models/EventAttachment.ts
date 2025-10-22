// Domain model for EventAttachment entity
export interface EventAttachment {
  id: number
  eventId: number
  fileName: string // Unique filename on disk
  originalName: string // Original filename from upload
  filePath: string // Full path to file
  fileSize: number // Size in bytes
  mimeType: string // MIME type of the file
  uploadedBy: number // User ID who uploaded
  uploadedAt: Date
}

// EventAttachment creation DTO
export interface CreateEventAttachmentDto {
  eventId: number
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  uploadedBy: number
}

// EventAttachment response for API
export interface EventAttachmentResponse {
  id: number
  eventId: number
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  uploadedBy: number
  uploaderName: string // Added for convenience
  uploadedAt: string // ISO 8601 string
  downloadUrl: string // URL to download the file
}
