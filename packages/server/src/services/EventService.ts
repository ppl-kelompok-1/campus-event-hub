import { IEventRepository } from '../repositories/IEventRepository';
import { IUserRepository } from '../repositories/IUserRepository';
import { IEventRegistrationRepository } from '../repositories/IEventRegistrationRepository';
import { ILocationRepository } from '../repositories/ILocationRepository';
import { Event, CreateEventDto, UpdateEventDto, EventResponse, EventStatus, ApprovalDto, toEventResponse, isValidEventDate, isValidEventTime, isEventInPast, isValidRegistrationPeriod, isRegistrationOpen, hasRegistrationStarted, hasRegistrationEnded } from '../models/Event';
import { UserRole } from '../models/User';
import { RegistrationStatus } from '../models/EventRegistration';
import { EventApprovalHistoryService } from './EventApprovalHistoryService';

export class EventService {
  constructor(
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository,
    private locationRepository: ILocationRepository,
    private eventRegistrationRepository?: IEventRegistrationRepository,
    private approvalHistoryService?: EventApprovalHistoryService
  ) {}

  // Create a new event
  async createEvent(eventData: CreateEventDto, createdBy: number, userRole: UserRole): Promise<EventResponse> {
    // Validate input
    await this.validateEventData(eventData);

    // Role-based status validation: only admin, superadmin, and approver can create published events
    if (eventData.status === EventStatus.PUBLISHED && userRole === UserRole.USER) {
      throw new Error('Regular users cannot create published events directly. Please create a draft and submit for approval.');
    }

    // Force draft status for regular users if they somehow send published status
    const finalEventData = {
      ...eventData,
      status: userRole === UserRole.USER ? EventStatus.DRAFT : (eventData.status || EventStatus.DRAFT)
    };

    // Create the event
    const event = await this.eventRepository.create(finalEventData, createdBy);

    // Get creator name and location name for response
    const creatorName = await this.eventRepository.getCreatorName(event.id);
    if (!creatorName) {
      throw new Error('Failed to get creator information');
    }

    const locationName = await this.eventRepository.getLocationName(event.id);
    if (!locationName) {
      throw new Error('Failed to get location information');
    }

    return toEventResponse(event, creatorName, locationName);
  }

  // Get all published events (public access)
  async getPublishedEvents(userId?: number): Promise<EventResponse[]> {
    const events = await this.eventRepository.findPublishedEvents();
    const enrichedEvents = await this.enrichEventsWithCreatorNames(events);
    
    // Add registration information if available
    if (this.eventRegistrationRepository) {
      return this.enrichEventsWithRegistrationInfo(enrichedEvents, userId);
    }
    
    return enrichedEvents;
  }

  // Get events with pagination
  async getEventsPaginated(page: number, limit: number, status?: EventStatus, userId?: number): Promise<{
    events: EventResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const result = await this.eventRepository.findPaginated(page, limit, status);
    let enrichedEvents = await this.enrichEventsWithCreatorNames(result.events);
    
    // Add registration information if available
    if (this.eventRegistrationRepository) {
      enrichedEvents = await this.enrichEventsWithRegistrationInfo(enrichedEvents, userId);
    }
    
    return {
      ...result,
      events: enrichedEvents
    };
  }

  // Get event by ID
  async getEventById(id: number, userId?: number): Promise<EventResponse | null> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      return null;
    }

    const creatorName = await this.eventRepository.getCreatorName(id);
    if (!creatorName) {
      throw new Error('Failed to get creator information');
    }

    const locationName = await this.eventRepository.getLocationName(id);
    if (!locationName) {
      throw new Error('Failed to get location information');
    }

    const baseResponse = toEventResponse(event, creatorName, locationName);

    // Add registration information if registration repository is available
    if (this.eventRegistrationRepository) {
      return this.enrichEventWithRegistrationInfo(baseResponse, userId);
    }

    return baseResponse;
  }

  // Get events created by a specific user
  async getUserEvents(userId: number): Promise<EventResponse[]> {
    const events = await this.eventRepository.findByCreator(userId);
    return this.enrichEventsWithCreatorNames(events);
  }

  // Update event (only by creator or admin)
  async updateEvent(id: number, eventData: UpdateEventDto, userId: number, userRole: UserRole): Promise<EventResponse | null> {
    // Check if event exists
    const existingEvent = await this.eventRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Check permissions
    const canModify = await this.canModifyEvent(id, userId, userRole);
    if (!canModify) {
      throw new Error('Insufficient permissions to modify this event');
    }

    // Validate locationId if being updated
    if (eventData.locationId !== undefined) {
      const locationExists = await this.locationRepository.exists(eventData.locationId);
      if (!locationExists) {
        throw new Error('Invalid location selected');
      }
    }

    // Validate update data
    if (eventData.eventDate !== undefined || eventData.eventTime !== undefined ||
        eventData.registrationStartDate !== undefined || eventData.registrationStartTime !== undefined ||
        eventData.registrationEndDate !== undefined || eventData.registrationEndTime !== undefined) {
      const newEventDate = eventData.eventDate || existingEvent.eventDate;
      const newEventTime = eventData.eventTime || existingEvent.eventTime;
      const newRegStartDate = eventData.registrationStartDate || existingEvent.registrationStartDate;
      const newRegStartTime = eventData.registrationStartTime || existingEvent.registrationStartTime;
      const newRegEndDate = eventData.registrationEndDate || existingEvent.registrationEndDate;
      const newRegEndTime = eventData.registrationEndTime || existingEvent.registrationEndTime;

      if (!isValidEventDate(newEventDate)) {
        throw new Error('Invalid event date format. Use YYYY-MM-DD');
      }
      if (!isValidEventTime(newEventTime)) {
        throw new Error('Invalid event time format. Use HH:MM');
      }
      if (!isValidRegistrationPeriod(newRegStartDate, newRegStartTime, newRegEndDate, newRegEndTime, newEventDate, newEventTime)) {
        throw new Error('Invalid registration period. Registration must start before it ends, and end before or at event start time');
      }
    }

    // Update the event
    const updatedEvent = await this.eventRepository.update(id, eventData);
    if (!updatedEvent) {
      throw new Error('Failed to update event');
    }

    const creatorName = await this.eventRepository.getCreatorName(id);
    if (!creatorName) {
      throw new Error('Failed to get creator information');
    }

    const locationName = await this.eventRepository.getLocationName(id);
    if (!locationName) {
      throw new Error('Failed to get location information');
    }

    return toEventResponse(updatedEvent, creatorName, locationName);
  }

  // Delete event (only by creator or admin)
  async deleteEvent(id: number, userId: number, userRole: UserRole): Promise<boolean> {
    // Check if event exists
    const exists = await this.eventRepository.exists(id);
    if (!exists) {
      throw new Error('Event not found');
    }

    // Check permissions
    const canModify = await this.canModifyEvent(id, userId, userRole);
    if (!canModify) {
      throw new Error('Insufficient permissions to delete this event');
    }

    return this.eventRepository.delete(id);
  }


  // Cancel event
  async cancelEvent(id: number, userId: number, userRole: UserRole): Promise<boolean> {
    // Check if event exists
    const exists = await this.eventRepository.exists(id);
    if (!exists) {
      throw new Error('Event not found');
    }

    // Check permissions
    const canModify = await this.canModifyEvent(id, userId, userRole);
    if (!canModify) {
      throw new Error('Insufficient permissions to cancel this event');
    }

    return this.eventRepository.updateStatus(id, EventStatus.CANCELLED);
  }


  // Validate event data
  private async validateEventData(eventData: CreateEventDto): Promise<void> {
    if (!eventData.title || eventData.title.trim().length === 0) {
      throw new Error('Event title is required');
    }

    if (!eventData.locationId) {
      throw new Error('Event location is required');
    }

    // Validate locationId exists
    const locationExists = await this.locationRepository.exists(eventData.locationId);
    if (!locationExists) {
      throw new Error('Invalid location selected');
    }

    if (!isValidEventDate(eventData.eventDate)) {
      throw new Error('Invalid event date format. Use YYYY-MM-DD');
    }

    if (!isValidEventTime(eventData.eventTime)) {
      throw new Error('Invalid event time format. Use HH:MM');
    }

    // Validate registration period
    if (!isValidRegistrationPeriod(
      eventData.registrationStartDate,
      eventData.registrationStartTime,
      eventData.registrationEndDate,
      eventData.registrationEndTime,
      eventData.eventDate,
      eventData.eventTime
    )) {
      throw new Error('Invalid registration period. Registration must start before it ends, and end before or at event start time');
    }

    if (eventData.maxAttendees !== undefined && eventData.maxAttendees < 1) {
      throw new Error('Maximum attendees must be at least 1');
    }

    // Check if event is in the past (only for published events)
    if (eventData.status === EventStatus.PUBLISHED && isEventInPast(eventData.eventDate, eventData.eventTime)) {
      throw new Error('Cannot create published events in the past');
    }

    // Check if registration end is in the past (only for published events)
    if (eventData.status === EventStatus.PUBLISHED && hasRegistrationEnded(eventData.registrationEndDate, eventData.registrationEndTime)) {
      throw new Error('Cannot publish events where registration has already ended');
    }
  }

  // Submit event for approval (regular users only)
  async submitForApproval(eventId: number, userId: number, userRole: UserRole): Promise<boolean> {
    // Check if event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Only regular users need approval
    if (userRole !== UserRole.USER) {
      throw new Error('Only regular users can submit events for approval');
    }

    // Check if user is the creator
    const isCreator = await this.eventRepository.isCreator(eventId, userId);
    if (!isCreator) {
      throw new Error('Only the event creator can submit for approval');
    }

    // Check if event is in draft or revision requested status
    if (event.status !== EventStatus.DRAFT && event.status !== EventStatus.REVISION_REQUESTED) {
      throw new Error('Only draft or revision requested events can be submitted for approval');
    }

    const statusBefore = event.status;
    const result = await this.eventRepository.submitForApproval(eventId);

    // Record approval history
    if (result && this.approvalHistoryService) {
      const user = await this.userRepository.findById(userId);
      if (user) {
        this.approvalHistoryService.recordSubmission(
          eventId,
          userId,
          user.name,
          statusBefore,
          EventStatus.PENDING_APPROVAL
        );
      }
    }

    return result;
  }

  // Approve event (approver only)
  async approveEvent(eventId: number, approverId: number, userRole: UserRole): Promise<boolean> {
    // Check if user is an approver
    if (userRole !== UserRole.APPROVER && userRole !== UserRole.ADMIN && userRole !== UserRole.SUPERADMIN) {
      throw new Error('Insufficient permissions to approve events');
    }

    // Check if event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is pending approval
    if (event.status !== EventStatus.PENDING_APPROVAL) {
      throw new Error('Only events pending approval can be approved');
    }

    // Check if event is in the past
    if (isEventInPast(event.eventDate, event.eventTime)) {
      throw new Error('Cannot approve events that are in the past');
    }

    const statusBefore = event.status;
    const result = await this.eventRepository.approveEvent(eventId, approverId);

    // Record approval history
    if (result && this.approvalHistoryService) {
      const approver = await this.userRepository.findById(approverId);
      if (approver) {
        this.approvalHistoryService.recordApproval(
          eventId,
          approverId,
          approver.name,
          statusBefore,
          EventStatus.PUBLISHED
        );
      }
    }

    return result;
  }

  // Request revision (approver only)
  async requestRevision(eventId: number, approverId: number, userRole: UserRole, approvalData: ApprovalDto): Promise<boolean> {
    // Check if user is an approver
    if (userRole !== UserRole.APPROVER && userRole !== UserRole.ADMIN && userRole !== UserRole.SUPERADMIN) {
      throw new Error('Insufficient permissions to request event revision');
    }

    // Check if event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is pending approval
    if (event.status !== EventStatus.PENDING_APPROVAL) {
      throw new Error('Only events pending approval can have revision requested');
    }

    // Validate revision comments
    if (!approvalData.revisionComments || approvalData.revisionComments.trim().length === 0) {
      throw new Error('Revision comments are required when requesting revision');
    }

    const statusBefore = event.status;
    const result = await this.eventRepository.requestRevision(eventId, approverId, approvalData.revisionComments);

    // Record approval history
    if (result && this.approvalHistoryService) {
      const approver = await this.userRepository.findById(approverId);
      if (approver) {
        this.approvalHistoryService.recordRevisionRequest(
          eventId,
          approverId,
          approver.name,
          approvalData.revisionComments,
          statusBefore,
          EventStatus.REVISION_REQUESTED
        );
      }
    }

    return result;
  }

  // Get all events in approval workflow (pending, revision, and approved) - for approvers to see complete history
  async getPendingApprovalEvents(): Promise<EventResponse[]> {
    // Get events with all approval workflow statuses
    const pendingEvents = await this.eventRepository.findByStatus(EventStatus.PENDING_APPROVAL);
    const revisionEvents = await this.eventRepository.findByStatus(EventStatus.REVISION_REQUESTED);
    const publishedEvents = await this.eventRepository.findByStatus(EventStatus.PUBLISHED);

    // Filter published events to only show those that went through approval (have approvedBy)
    const approvedEvents = publishedEvents.filter(event => event.approvedBy !== undefined && event.approvedBy !== null);

    // Combine all and sort by updated_at (most recent first)
    const allEvents = [...pendingEvents, ...revisionEvents, ...approvedEvents];
    allEvents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return this.enrichEventsWithNames(allEvents);
  }

  // Updated publish event method for new approval workflow
  async publishEvent(id: number, userId: number, userRole: UserRole): Promise<boolean> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check permissions based on role
    if (userRole === UserRole.USER) {
      // Regular users must submit for approval instead of publishing directly
      throw new Error('Regular users must submit events for approval rather than publishing directly');
    }

    // Admin, superadmin, and approver can publish directly
    const canModify = await this.canModifyEvent(id, userId, userRole);
    if (!canModify) {
      throw new Error('Insufficient permissions to publish this event');
    }

    // Check if event is in the past
    if (isEventInPast(event.eventDate, event.eventTime)) {
      throw new Error('Cannot publish events that are in the past');
    }

    // For admin/superadmin/approver, auto-approve when publishing
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN || userRole === UserRole.APPROVER) {
      return this.eventRepository.approveEvent(id, userId);
    }

    return this.eventRepository.updateStatus(id, EventStatus.PUBLISHED);
  }

  // Check if user can modify event (updated for approver role)
  private async canModifyEvent(eventId: number, userId: number, userRole: UserRole): Promise<boolean> {
    // Admins, superadmins, and approvers can modify any event
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN || userRole === UserRole.APPROVER) {
      return true;
    }

    // Regular users can only modify their own events
    return this.eventRepository.isCreator(eventId, userId);
  }

  // Helper to enrich events with creator and approver names
  private async enrichEventsWithNames(events: Event[]): Promise<EventResponse[]> {
    const enrichedEvents: EventResponse[] = [];

    for (const event of events) {
      const creatorName = await this.eventRepository.getCreatorName(event.id);
      const locationName = await this.eventRepository.getLocationName(event.id);
      const approverName = event.approvedBy ? (await this.eventRepository.getApproverName(event.id)) || undefined : undefined;

      if (creatorName && locationName) {
        enrichedEvents.push(toEventResponse(event, creatorName, locationName, approverName));
      }
    }

    return enrichedEvents;
  }

  // Helper to enrich events with creator names (backward compatibility)
  private async enrichEventsWithCreatorNames(events: Event[]): Promise<EventResponse[]> {
    return this.enrichEventsWithNames(events);
  }

  // Helper to enrich event with registration information
  private async enrichEventWithRegistrationInfo(event: EventResponse, userId?: number): Promise<EventResponse> {
    if (!this.eventRegistrationRepository) {
      return event;
    }

    // Get current attendee count
    const currentAttendees = await this.eventRegistrationRepository.getRegistrationCountByStatus(event.id, RegistrationStatus.REGISTERED);

    // Check if event is full
    const isFull = event.maxAttendees ? currentAttendees >= event.maxAttendees : false;

    // Check registration period status
    const registrationOpen = isRegistrationOpen(
      event.registrationStartDate,
      event.registrationStartTime,
      event.registrationEndDate,
      event.registrationEndTime
    );
    const registrationStarted = hasRegistrationStarted(event.registrationStartDate, event.registrationStartTime);
    const registrationEnded = hasRegistrationEnded(event.registrationEndDate, event.registrationEndTime);

    // Check if user can register (event is published, registration is open, not full, not in past)
    const canRegister = event.status === EventStatus.PUBLISHED &&
                       registrationOpen &&
                       !isFull &&
                       !isEventInPast(event.eventDate, event.eventTime);

    let isUserRegistered = false;
    let userRegistrationStatus: 'registered' | 'waitlisted' | 'cancelled' | undefined;

    // If user is provided, check their registration status
    if (userId) {
      const registration = await this.eventRegistrationRepository.findByEventAndUser(event.id, userId);
      if (registration) {
        isUserRegistered = registration.status === RegistrationStatus.REGISTERED || registration.status === RegistrationStatus.WAITLISTED;
        userRegistrationStatus = registration.status as 'registered' | 'waitlisted' | 'cancelled';
      }
    }

    return {
      ...event,
      currentAttendees,
      isUserRegistered,
      userRegistrationStatus,
      isFull,
      canRegister,
      isRegistrationOpen: registrationOpen,
      hasRegistrationStarted: registrationStarted,
      hasRegistrationEnded: registrationEnded
    };
  }

  // Helper to enrich multiple events with registration information
  private async enrichEventsWithRegistrationInfo(events: EventResponse[], userId?: number): Promise<EventResponse[]> {
    if (!this.eventRegistrationRepository) {
      return events;
    }

    const enrichedEvents: EventResponse[] = [];
    for (const event of events) {
      const enrichedEvent = await this.enrichEventWithRegistrationInfo(event, userId);
      enrichedEvents.push(enrichedEvent);
    }
    return enrichedEvents;
  }

  // Helper function to escape CSV values
  private escapeCSV(value: string | number | undefined | null): string {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  // Helper function to get human-readable status text
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      revision_requested: 'Revision Requested',
      published: 'Published',
      cancelled: 'Cancelled',
      completed: 'Completed'
    };
    return statusMap[status] || status;
  }

  // Helper function to format date (YYYY-MM-DD format for CSV)
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper function to format date time (YYYY-MM-DD HH:mm:ss format for CSV)
  private formatDateTime(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Helper function to format attendees
  private formatAttendees(currentAttendees: number | undefined, maxAttendees: number | undefined): string {
    const current = currentAttendees || 0;
    return maxAttendees ? `${current}/${maxAttendees}` : `${current}`;
  }

  // Export events to CSV
  async exportEventsToCSV(userId: number, userRole: UserRole, filters?: {
    status?: EventStatus;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<string> {
    let events: EventResponse[];

    // Fetch events based on user role
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN) {
      // Admins can export all events
      const result = await this.getEventsPaginated(1, 10000, filters?.status, userId);
      events = result.events;
    } else {
      // Regular users and approvers can only export their own events
      events = await this.getUserEvents(userId);

      // Apply status filter if provided
      if (filters?.status) {
        events = events.filter(event => event.status === filters.status);
      }
    }

    // Apply date range filter if provided
    if (filters?.dateFrom) {
      events = events.filter(event => event.eventDate >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      events = events.filter(event => event.eventDate <= filters.dateTo!);
    }

    // CSV headers
    const headers = ['Event Title', 'Creator', 'Status', 'Event Date', 'Location', 'Attendees', 'Last Updated'];

    // Map events to CSV rows
    const rows = events.map(event => [
      this.escapeCSV(event.title),
      this.escapeCSV(event.creatorName),
      this.getStatusText(event.status),
      this.formatDateTime(`${event.eventDate}T${event.eventTime}`),
      this.escapeCSV(event.locationName),
      this.formatAttendees(event.currentAttendees, event.maxAttendees),
      this.formatDateTime(event.updatedAt)
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }
}