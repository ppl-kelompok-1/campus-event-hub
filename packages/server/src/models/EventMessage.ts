// Validation constants
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_MESSAGE_LENGTH = 2000;

// Domain model for EventMessage entity
export interface EventMessage {
  id: number;
  eventId: number;
  senderId: number;
  subject: string;
  message: string;
  recipientCount: number;
  sentAt: Date;
  createdAt: Date;
}

// Event message response with enriched data for API responses
export interface EventMessageResponse {
  id: number;
  eventId: number;
  senderId: number;
  senderName: string;
  eventTitle: string;
  subject: string;
  message: string;
  recipientCount: number;
  sentAt: Date;
  createdAt: Date;
}

// DTO for creating a new event message
export interface CreateEventMessageDto {
  subject: string;
  message: string;
}

// Helper function to convert EventMessage to EventMessageResponse
export function toEventMessageResponse(
  eventMessage: EventMessage,
  senderName: string,
  eventTitle: string
): EventMessageResponse {
  return {
    ...eventMessage,
    senderName,
    eventTitle
  };
}

// Validation helpers
export function isValidSubject(subject: string): boolean {
  return subject.trim().length > 0 && subject.length <= MAX_SUBJECT_LENGTH;
}

export function isValidMessage(message: string): boolean {
  return message.trim().length > 0 && message.length <= MAX_MESSAGE_LENGTH;
}

export function validateCreateEventMessageDto(dto: CreateEventMessageDto): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dto.subject || !isValidSubject(dto.subject)) {
    errors.push(`Subject is required and must be between 1 and ${MAX_SUBJECT_LENGTH} characters`);
  }

  if (!dto.message || !isValidMessage(dto.message)) {
    errors.push(`Message is required and must be between 1 and ${MAX_MESSAGE_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
