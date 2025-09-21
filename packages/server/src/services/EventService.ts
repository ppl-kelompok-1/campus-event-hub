import { IEventRepository } from '../repositories/IEventRepository';
import { IUserRepository } from '../repositories/IUserRepository';
import { IEventRegistrationRepository } from '../repositories/IEventRegistrationRepository';
import { Event, CreateEventDto, UpdateEventDto, EventResponse, EventStatus, ApprovalDto, toEventResponse, isValidEventDate, isValidEventTime, isEventInPast } from '../models/Event';
import { UserRole } from '../models/User';
import { RegistrationStatus } from '../models/EventRegistration';

export class EventService {
  constructor(
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository,
    private eventRegistrationRepository?: IEventRegistrationRepository
  ) {}

  // Create a new event
  async createEvent(eventData: CreateEventDto, createdBy: number, userRole: UserRole): Promise<EventResponse> {
    // Validate input
    this.validateEventData(eventData);

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
    
    // Get creator name for response
    const creatorName = await this.eventRepository.getCreatorName(event.id);
    if (!creatorName) {
      throw new Error('Failed to get creator information');
    }

    return toEventResponse(event, creatorName);
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

    const baseResponse = toEventResponse(event, creatorName);

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

    // Validate update data
    if (eventData.eventDate !== undefined || eventData.eventTime !== undefined) {
      const newDate = eventData.eventDate || existingEvent.eventDate;
      const newTime = eventData.eventTime || existingEvent.eventTime;
      
      if (!isValidEventDate(newDate)) {
        throw new Error('Invalid event date format. Use YYYY-MM-DD');
      }
      if (!isValidEventTime(newTime)) {
        throw new Error('Invalid event time format. Use HH:MM');
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

    return toEventResponse(updatedEvent, creatorName);
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
  private validateEventData(eventData: CreateEventDto): void {
    if (!eventData.title || eventData.title.trim().length === 0) {
      throw new Error('Event title is required');
    }

    if (!eventData.location || eventData.location.trim().length === 0) {
      throw new Error('Event location is required');
    }

    if (!isValidEventDate(eventData.eventDate)) {
      throw new Error('Invalid event date format. Use YYYY-MM-DD');
    }

    if (!isValidEventTime(eventData.eventTime)) {
      throw new Error('Invalid event time format. Use HH:MM');
    }

    if (eventData.maxAttendees !== undefined && eventData.maxAttendees < 1) {
      throw new Error('Maximum attendees must be at least 1');
    }

    // Check if event is in the past (only for published events)
    if (eventData.status === EventStatus.PUBLISHED && isEventInPast(eventData.eventDate, eventData.eventTime)) {
      throw new Error('Cannot create published events in the past');
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

    return this.eventRepository.submitForApproval(eventId);
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

    return this.eventRepository.approveEvent(eventId, approverId);
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

    return this.eventRepository.requestRevision(eventId, approverId, approvalData.revisionComments);
  }

  // Get events pending approval (approver only)
  async getPendingApprovalEvents(): Promise<EventResponse[]> {
    const events = await this.eventRepository.findByStatus(EventStatus.PENDING_APPROVAL);
    return this.enrichEventsWithNames(events);
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
      const approverName = event.approvedBy ? (await this.eventRepository.getApproverName(event.id)) || undefined : undefined;
      
      if (creatorName) {
        enrichedEvents.push(toEventResponse(event, creatorName, approverName));
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
    
    // Check if user can register (event is published, not full, not in past)
    const canRegister = event.status === EventStatus.PUBLISHED && 
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
      canRegister
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
}