import { EventMessage, CreateEventMessageDto } from '../models/EventMessage';

export interface IEventMessageRepository {
  // Create a new event message
  create(messageData: CreateEventMessageDto & {
    eventId: number;
    senderId: number;
    recipientCount: number;
  }): Promise<EventMessage>;

  // Find message by ID
  findById(id: number): Promise<EventMessage | null>;

  // Find all messages for an event (ordered by sent_at DESC)
  findByEventId(eventId: number): Promise<EventMessage[]>;

  // Find all messages sent by a user
  findBySenderId(senderId: number): Promise<EventMessage[]>;

  // Get count of messages for an event
  countByEventId(eventId: number): Promise<number>;

  // Get event title for a message (for response enrichment)
  getEventTitle(eventId: number): Promise<string | null>;

  // Get sender name for a message (for response enrichment)
  getSenderName(senderId: number): Promise<string | null>;
}
