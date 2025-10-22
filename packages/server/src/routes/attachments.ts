import { Router, Request, Response } from 'express'
import { EventAttachmentService } from '../services/EventAttachmentService'
import { AuthService } from '../services/AuthService'
import { asyncHandler } from '../middleware/error'
import { authenticate } from '../middleware/auth'
import { upload } from '../infrastructure/upload/multerConfig'
import fs from 'fs'

export const createAttachmentRouter = (
  attachmentService: EventAttachmentService,
  authService: AuthService
): Router => {
  const router = Router()

  // POST /api/v1/events/:eventId/attachments - Upload attachment to event (authenticated)
  router.post(
    '/:eventId/attachments',
    authenticate(authService),
    upload.single('file'),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        })
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        })
      }

      const eventId = parseInt(req.params.eventId)
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        })
      }

      try {
        const attachment = await attachmentService.uploadAttachment(
          eventId,
          req.file,
          req.user.userId
        )

        res.status(201).json({
          success: true,
          data: attachment
        })
      } catch (error) {
        // Clean up uploaded file if there's an error
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path)
        }
        throw error
      }
    })
  )

  // GET /api/v1/events/:eventId/attachments - Get all attachments for an event
  router.get(
    '/:eventId/attachments',
    asyncHandler(async (req: Request, res: Response) => {
      const eventId = parseInt(req.params.eventId)
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        })
      }

      const attachments = await attachmentService.getEventAttachments(eventId)

      res.json({
        success: true,
        data: attachments
      })
    })
  )

  // GET /api/v1/events/:eventId/attachments/:id - Get single attachment info
  router.get(
    '/:eventId/attachments/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid attachment ID'
        })
      }

      const attachment = await attachmentService.getAttachment(id)
      if (!attachment) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found'
        })
      }

      res.json({
        success: true,
        data: attachment
      })
    })
  )

  // GET /api/v1/events/:eventId/attachments/:id/download - Download attachment file
  router.get(
    '/:eventId/attachments/:id/download',
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid attachment ID'
        })
      }

      const attachment = await attachmentService.getAttachment(id)
      if (!attachment) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found'
        })
      }

      // Get the full file path from repository
      const attachmentRecord = await attachmentService.getAttachment(id)
      if (!attachmentRecord) {
        return res.status(404).json({
          success: false,
          error: 'Attachment file not found'
        })
      }

      // Send file
      res.download(attachmentRecord.fileName, attachmentRecord.originalName)
    })
  )

  // DELETE /api/v1/events/:eventId/attachments/:id - Delete an attachment (owner/creator/admin)
  router.delete(
    '/:eventId/attachments/:id',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        })
      }

      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid attachment ID'
        })
      }

      const deleted = await attachmentService.deleteAttachment(
        id,
        req.user.userId,
        req.user.role
      )

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found'
        })
      }

      res.json({
        success: true,
        message: 'Attachment deleted successfully'
      })
    })
  )

  return router
}
