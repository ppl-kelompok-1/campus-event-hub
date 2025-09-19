import { Router, Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../middleware/error';
import { authenticate, authorize } from '../middleware/auth';
import { CreateEventDto, UpdateEventDto, EventStatus } from '../models/Event';
import { UserRole } from '../models/User';

export const createEventRouter = (eventService: EventService, authService: AuthService): Router => {
  const router = Router();

  // GET /api/v1/events - Get all published events (public access)
  router.get('/', 
    asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // For public access, only show published events
      const result = await eventService.getEventsPaginated(page, limit, EventStatus.PUBLISHED);
      
      res.json({
        success: true,
        data: result.events,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    })
  );

  // GET /api/v1/events/my - Get current user's events (authenticated)
  router.get('/my',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const events = await eventService.getUserEvents(req.user.userId);
      
      res.json({
        success: true,
        data: events
      });
    })
  );

  // GET /api/v1/events/all - Get all events with status filter (admin only)
  router.get('/all',
    authenticate(authService),
    authorize(UserRole.ADMIN, UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as EventStatus | undefined;
      
      const result = await eventService.getEventsPaginated(page, limit, status);
      
      res.json({
        success: true,
        data: result.events,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    })
  );

  // POST /api/v1/events - Create new event (authenticated users)
  router.post('/',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const eventData: CreateEventDto = {
        title: req.body.title,
        description: req.body.description,
        eventDate: req.body.eventDate,
        eventTime: req.body.eventTime,
        location: req.body.location,
        maxAttendees: req.body.maxAttendees,
        status: req.body.status || EventStatus.DRAFT
      };

      try {
        const event = await eventService.createEvent(eventData, req.user.userId);
        
        res.status(201).json({
          success: true,
          data: event,
          message: 'Event created successfully'
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create event'
        });
      }
    })
  );

  // GET /api/v1/events/:id - Get event by ID
  router.get('/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      const event = await eventService.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: event
      });
    })
  );

  // PUT /api/v1/events/:id - Update event (creator or admin)
  router.put('/:id',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      const updateData: UpdateEventDto = {
        title: req.body.title,
        description: req.body.description,
        eventDate: req.body.eventDate,
        eventTime: req.body.eventTime,
        location: req.body.location,
        maxAttendees: req.body.maxAttendees,
        status: req.body.status
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateEventDto] === undefined) {
          delete updateData[key as keyof UpdateEventDto];
        }
      });

      try {
        const event = await eventService.updateEvent(eventId, updateData, req.user.userId, req.user.role);
        
        res.json({
          success: true,
          data: event,
          message: 'Event updated successfully'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('permissions') ? 403 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update event'
        });
      }
    })
  );

  // DELETE /api/v1/events/:id - Delete event (creator or admin)
  router.delete('/:id',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      try {
        const deleted = await eventService.deleteEvent(eventId, req.user.userId, req.user.role);
        
        if (!deleted) {
          return res.status(404).json({
            success: false,
            error: 'Event not found or already deleted'
          });
        }

        res.json({
          success: true,
          message: 'Event deleted successfully'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('permissions') ? 403 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete event'
        });
      }
    })
  );

  // POST /api/v1/events/:id/publish - Publish event (creator or admin)
  router.post('/:id/publish',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      try {
        const published = await eventService.publishEvent(eventId, req.user.userId, req.user.role);
        
        if (!published) {
          return res.status(400).json({
            success: false,
            error: 'Failed to publish event'
          });
        }

        res.json({
          success: true,
          message: 'Event published successfully'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('permissions') ? 403 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to publish event'
        });
      }
    })
  );

  // POST /api/v1/events/:id/cancel - Cancel event (creator or admin)
  router.post('/:id/cancel',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      try {
        const cancelled = await eventService.cancelEvent(eventId, req.user.userId, req.user.role);
        
        if (!cancelled) {
          return res.status(400).json({
            success: false,
            error: 'Failed to cancel event'
          });
        }

        res.json({
          success: true,
          message: 'Event cancelled successfully'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('permissions') ? 403 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel event'
        });
      }
    })
  );

  return router;
};