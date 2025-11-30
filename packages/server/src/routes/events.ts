import { Router, Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { EventRegistrationService } from '../services/EventRegistrationService';
import { AuthService } from '../services/AuthService';
import { EventApprovalHistoryService } from '../services/EventApprovalHistoryService';
import { asyncHandler } from '../middleware/error';
import { authenticate, authorize } from '../middleware/auth';
import { CreateEventDto, UpdateEventDto, EventStatus, ApprovalDto } from '../models/Event';
import { UserRole } from '../models/User';

export const createEventRouter = (eventService: EventService, eventRegistrationService: EventRegistrationService, authService: AuthService, approvalHistoryService: EventApprovalHistoryService): Router => {
  const router = Router();

  // GET /api/v1/events - Get all published events (public access)
  router.get('/', 
    asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Try to get user ID if authenticated (optional)
      let userId: number | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = await authService.verifyToken(token);
          userId = decoded.userId;
        } catch {
          // Ignore auth errors for public endpoint
        }
      }
      
      // For public access, only show published events
      const result = await eventService.getEventsPaginated(page, limit, EventStatus.PUBLISHED, userId);
      
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
        registrationStartDate: req.body.registrationStartDate,
        registrationStartTime: req.body.registrationStartTime,
        registrationEndDate: req.body.registrationEndDate,
        registrationEndTime: req.body.registrationEndTime,
        locationId: req.body.locationId,
        maxAttendees: req.body.maxAttendees,
        status: req.body.status || EventStatus.DRAFT,
        allowedCategories: req.body.allowedCategories
      };

      try {
        const event = await eventService.createEvent(eventData, req.user.userId, req.user.role);
        
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

  // GET /api/v1/events/pending - Get events pending approval (approver, admin, superadmin)
  router.get('/pending',
    authenticate(authService),
    authorize(UserRole.APPROVER, UserRole.ADMIN, UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      try {
        // Extract pagination parameters from query string
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // Get paginated events
        const result = await eventService.getPendingApprovalEvents(page, limit);

        res.json({
          success: true,
          data: result.events,
          pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            limit: limit
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get pending approval events'
        });
      }
    })
  );

  // GET /api/v1/events/joined - Get user's joined events
  router.get('/joined',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      try {
        const joinedEvents = await eventRegistrationService.getUserJoinedEvents(req.user.userId);
        
        res.json({
          success: true,
          data: joinedEvents
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get joined events'
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

      // Try to get user ID if authenticated (optional)
      let userId: number | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = await authService.verifyToken(token);
          userId = decoded.userId;
        } catch {
          // Ignore auth errors for public endpoint
        }
      }

      const event = await eventService.getEventById(eventId, userId);
      
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

  // GET /api/v1/events/:id/approval-history - Get approval history for an event
  router.get('/:id/approval-history',
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
        // Get the event to check permissions
        const event = await eventService.getEventById(eventId, req.user.userId);

        if (!event) {
          return res.status(404).json({
            success: false,
            error: 'Event not found'
          });
        }

        // Only allow event creator, approvers, and admins to view approval history
        const canViewHistory =
          event.createdBy === req.user.userId ||
          req.user.role === UserRole.APPROVER ||
          req.user.role === UserRole.ADMIN ||
          req.user.role === UserRole.SUPERADMIN;

        if (!canViewHistory) {
          return res.status(403).json({
            success: false,
            error: 'You do not have permission to view this event\'s approval history'
          });
        }

        const history = await approvalHistoryService.getEventHistory(eventId);

        res.json({
          success: true,
          data: history
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get approval history'
        });
      }
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
        registrationStartDate: req.body.registrationStartDate,
        registrationStartTime: req.body.registrationStartTime,
        registrationEndDate: req.body.registrationEndDate,
        registrationEndTime: req.body.registrationEndTime,
        locationId: req.body.locationId,
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

  // POST /api/v1/events/:id/submit-for-approval - Submit event for approval (user only)
  router.post('/:id/submit-for-approval',
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
        const submitted = await eventService.submitForApproval(eventId, req.user.userId, req.user.role);
        
        if (!submitted) {
          return res.status(400).json({
            success: false,
            error: 'Failed to submit event for approval'
          });
        }

        res.json({
          success: true,
          message: 'Event submitted for approval successfully'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('permissions') ? 403 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to submit event for approval'
        });
      }
    })
  );

  // POST /api/v1/events/:id/approve - Approve event (approver, admin, superadmin)
  router.post('/:id/approve',
    authenticate(authService),
    authorize(UserRole.APPROVER, UserRole.ADMIN, UserRole.SUPERADMIN),
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
        const approved = await eventService.approveEvent(eventId, req.user.userId, req.user.role);
        
        if (!approved) {
          return res.status(400).json({
            success: false,
            error: 'Failed to approve event'
          });
        }

        res.json({
          success: true,
          message: 'Event approved successfully'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('permissions') ? 403 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to approve event'
        });
      }
    })
  );

  // POST /api/v1/events/:id/request-revision - Request revision (approver, admin, superadmin)
  router.post('/:id/request-revision',
    authenticate(authService),
    authorize(UserRole.APPROVER, UserRole.ADMIN, UserRole.SUPERADMIN),
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

      const approvalData: ApprovalDto = {
        revisionComments: req.body.revisionComments
      };

      try {
        const requested = await eventService.requestRevision(eventId, req.user.userId, req.user.role, approvalData);
        
        if (!requested) {
          return res.status(400).json({
            success: false,
            error: 'Failed to request revision'
          });
        }

        res.json({
          success: true,
          message: 'Revision requested successfully'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('permissions') ? 403 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to request revision'
        });
      }
    })
  );

  // Event Registration Endpoints

  // POST /api/v1/events/:id/register - Join/register for an event
  router.post('/:id/register',
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
        const registration = await eventRegistrationService.registerForEvent(eventId, req.user.userId, req.user.role);
        
        res.status(201).json({
          success: true,
          data: registration,
          message: registration.status === 'registered' 
            ? 'Successfully registered for event' 
            : 'Added to event waitlist'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('already registered') ? 409 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to register for event'
        });
      }
    })
  );

  // DELETE /api/v1/events/:id/register - Leave/unregister from an event
  router.delete('/:id/register',
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
        const success = await eventRegistrationService.unregisterFromEvent(eventId, req.user.userId, req.user.role);
        
        if (!success) {
          return res.status(400).json({
            success: false,
            error: 'Failed to unregister from event'
          });
        }

        res.json({
          success: true,
          message: 'Successfully unregistered from event'
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('not registered') ? 409 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to unregister from event'
        });
      }
    })
  );

  // GET /api/v1/events/:id/registrations - Get event registrations (creator/admin only)
  router.get('/:id/registrations',
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
        const registrations = await eventRegistrationService.getEventRegistrations(eventId, req.user.userId, req.user.role);
        
        res.json({
          success: true,
          data: registrations
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                          error instanceof Error && error.message.includes('permissions') ? 403 : 400;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get event registrations'
        });
      }
    })
  );


  // GET /api/v1/events/:id/stats - Get event registration statistics
  router.get('/:id/stats',
    asyncHandler(async (req: Request, res: Response) => {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      try {
        const stats = await eventRegistrationService.getEventRegistrationStats(eventId);
        
        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
        
        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get event statistics'
        });
      }
    })
  );

  // GET /api/v1/events/:id/attendees - Get public attendee list (names only)
  router.get('/:id/attendees',
    asyncHandler(async (req: Request, res: Response) => {
      const eventId = parseInt(req.params.id);

      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      try {
        const attendees = await eventRegistrationService.getEventAttendees(eventId);

        res.json({
          success: true,
          data: attendees
        });
      } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get event attendees'
        });
      }
    })
  );

  // GET /api/v1/events/export/csv - Export events to CSV
  router.get('/export/csv',
    authenticate(authService),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      try {
        // Parse filters from query parameters
        const filters: {
          status?: EventStatus;
          dateFrom?: string;
          dateTo?: string;
        } = {};

        if (req.query.status) {
          filters.status = req.query.status as EventStatus;
        }
        if (req.query.dateFrom) {
          filters.dateFrom = req.query.dateFrom as string;
        }
        if (req.query.dateTo) {
          filters.dateTo = req.query.dateTo as string;
        }

        // Generate CSV
        const csvContent = await eventService.exportEventsToCSV(
          req.user.userId,
          req.user.role,
          filters
        );

        // Generate filename with timestamp
        const timestamp = new Date().toISOString()
          .replace(/:/g, '-')
          .replace(/\..+/, '')
          .replace('T', '-');
        const filename = `events-${timestamp}.csv`;

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.send(csvContent);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to export events to CSV'
        });
      }
    })
  );

  return router;
};