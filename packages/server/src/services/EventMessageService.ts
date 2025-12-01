import { IEventMessageRepository } from '../repositories/IEventMessageRepository';
import { IEventRepository } from '../repositories/IEventRepository';
import { IEventRegistrationRepository } from '../repositories/IEventRegistrationRepository';
import { IUserRepository } from '../repositories/IUserRepository';
import { NotificationService } from './NotificationService';
import {
  EventMessage,
  CreateEventMessageDto,
  EventMessageResponse,
  toEventMessageResponse,
  validateCreateEventMessageDto
} from '../models/EventMessage';
import { UserRole } from '../models/User';
import { RegistrationStatus } from '../models/EventRegistration';

export class EventMessageService {
  constructor(
    private eventMessageRepository: IEventMessageRepository,
    private eventRepository: IEventRepository,
    private eventRegistrationRepository: IEventRegistrationRepository,
    private userRepository: IUserRepository,
    private notificationService: NotificationService
  ) {}

  // Send a message to all registered attendees
  async sendMessageToAttendees(
    eventId: number,
    senderId: number,
    userRole: UserRole,
    data: CreateEventMessageDto
  ): Promise<EventMessageResponse> {
    // Validate input data
    const validation = validateCreateEventMessageDto(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join('; '));
    }

    // Verify event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Validate permissions (creator or admin/superadmin only)
    if (!this.validateSendPermissions(event.createdBy, senderId, userRole)) {
      throw new Error('Only the event creator or administrators can send messages');
    }

    // Get registered attendees (status = 'registered' only, no waitlisted)
    const registrations = await this.eventRegistrationRepository.findByEventId(eventId);
    const registeredAttendees = registrations.filter(
      reg => reg.status === RegistrationStatus.REGISTERED
    );

    if (registeredAttendees.length === 0) {
      throw new Error('No registered attendees found for this event');
    }

    // Extract user IDs
    const attendeeUserIds = registeredAttendees.map(reg => reg.userId);

    // Store message in database
    const messageRecord = await this.eventMessageRepository.create({
      eventId,
      senderId,
      subject: data.subject.trim(),
      message: data.message.trim(),
      recipientCount: attendeeUserIds.length
    });

    // Get sender name for email
    const sender = await this.userRepository.findById(senderId);
    const senderName = sender?.name || 'Event Organizer';

    // Send emails to all attendees (async, don't wait)
    this.notificationService
      .sendEventMessageToAttendees(eventId, data.subject, data.message, senderName, attendeeUserIds)
      .catch(error => {
        console.error(`Failed to send message emails for event ${eventId}:`, error);
      });

    // Return enriched response
    return this.enrichMessageWithDetails(messageRecord);
  }

  // Get all messages for an event
  async getEventMessages(
    eventId: number,
    userId: number,
    userRole: UserRole
  ): Promise<EventMessageResponse[]> {
    // Verify event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Validate permissions (creator or admin/superadmin only)
    if (!this.validateViewPermissions(event.createdBy, userId, userRole)) {
      throw new Error('Only the event creator or administrators can view message history');
    }

    // Get messages from repository (already ordered by sent_at DESC)
    const messages = await this.eventMessageRepository.findByEventId(eventId);

    // Enrich all messages with details
    const enrichedMessages = await Promise.all(
      messages.map(msg => this.enrichMessageWithDetails(msg))
    );

    return enrichedMessages;
  }

  // Helper: Validate send permissions
  private validateSendPermissions(
    eventCreatorId: number,
    userId: number,
    userRole: UserRole
  ): boolean {
    // Event creator can send
    if (userId === eventCreatorId) {
      return true;
    }

    // Admin or superadmin can send
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN) {
      return true;
    }

    return false;
  }

  // Helper: Validate view permissions (same as send permissions)
  private validateViewPermissions(
    eventCreatorId: number,
    userId: number,
    userRole: UserRole
  ): boolean {
    return this.validateSendPermissions(eventCreatorId, userId, userRole);
  }

  // Helper: Enrich message with event title and sender name
  private async enrichMessageWithDetails(message: EventMessage): Promise<EventMessageResponse> {
    const eventTitle = await this.eventMessageRepository.getEventTitle(message.eventId);
    const senderName = await this.eventMessageRepository.getSenderName(message.senderId);

    return toEventMessageResponse(
      message,
      senderName || 'Unknown',
      eventTitle || 'Unknown Event'
    );
  }
}
