import { IEventRepository } from '../repositories/IEventRepository';
import { IUserRepository } from '../repositories/IUserRepository';
import { Event, CreateEventDto, UpdateEventDto, EventResponse, EventStatus, toEventResponse, isValidEventDate, isValidEventTime, isEventInPast } from '../models/Event';
import { UserRole } from '../models/User';

export class EventService {
  constructor(
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository
  ) {}

  // Create a new event
  async createEvent(eventData: CreateEventDto, createdBy: number): Promise<EventResponse> {
    // Validate input
    this.validateEventData(eventData);

    // Create the event
    const event = await this.eventRepository.create(eventData, createdBy);
    
    // Get creator name for response
    const creatorName = await this.eventRepository.getCreatorName(event.id);
    if (!creatorName) {
      throw new Error('Failed to get creator information');
    }

    return toEventResponse(event, creatorName);
  }

  // Get all published events (public access)
  async getPublishedEvents(): Promise<EventResponse[]> {
    const events = await this.eventRepository.findPublishedEvents();
    return this.enrichEventsWithCreatorNames(events);
  }

  // Get events with pagination
  async getEventsPaginated(page: number, limit: number, status?: EventStatus): Promise<{
    events: EventResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const result = await this.eventRepository.findPaginated(page, limit, status);
    const enrichedEvents = await this.enrichEventsWithCreatorNames(result.events);
    
    return {
      ...result,
      events: enrichedEvents
    };
  }

  // Get event by ID
  async getEventById(id: number): Promise<EventResponse | null> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      return null;
    }

    const creatorName = await this.eventRepository.getCreatorName(id);
    if (!creatorName) {
      throw new Error('Failed to get creator information');
    }

    return toEventResponse(event, creatorName);
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

  // Publish event (change status to published)
  async publishEvent(id: number, userId: number, userRole: UserRole): Promise<boolean> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check permissions
    const canModify = await this.canModifyEvent(id, userId, userRole);
    if (!canModify) {
      throw new Error('Insufficient permissions to publish this event');
    }

    // Check if event is in the past
    if (isEventInPast(event.eventDate, event.eventTime)) {
      throw new Error('Cannot publish events that are in the past');
    }

    return this.eventRepository.updateStatus(id, EventStatus.PUBLISHED);
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

  // Check if user can modify event
  private async canModifyEvent(eventId: number, userId: number, userRole: UserRole): Promise<boolean> {
    // Admins and superadmins can modify any event
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN) {
      return true;
    }

    // Regular users can only modify their own events
    return this.eventRepository.isCreator(eventId, userId);
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

  // Helper to enrich events with creator names
  private async enrichEventsWithCreatorNames(events: Event[]): Promise<EventResponse[]> {
    const enrichedEvents: EventResponse[] = [];
    
    for (const event of events) {
      const creatorName = await this.eventRepository.getCreatorName(event.id);
      if (creatorName) {
        enrichedEvents.push(toEventResponse(event, creatorName));
      }
    }
    
    return enrichedEvents;
  }
}