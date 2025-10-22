// Event status enum
export enum EventStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  REVISION_REQUESTED = 'revision_requested',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

// Domain model for Event entity
export interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string; // ISO 8601 date string (YYYY-MM-DD)
  eventTime: string; // Time in HH:MM format
  eventEndDate?: string; // ISO 8601 date string (YYYY-MM-DD) - optional for multi-day events
  eventEndTime: string; // Time in HH:MM format - end time of event
  locationId: number; // Foreign key to locations table
  maxAttendees?: number;
  createdBy: number; // User ID
  status: EventStatus;
  approvedBy?: number; // User ID of the approver
  approvalDate?: Date; // When the event was approved
  revisionComments?: string; // Comments from approver when requesting revision
  createdAt: Date;
  updatedAt: Date;
}

// Event response with creator info for API responses
export interface EventResponse {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  eventTime: string;
  eventEndDate?: string;
  eventEndTime: string;
  locationId: number;
  locationName: string; // Added for convenience
  maxAttendees?: number;
  createdBy: number;
  creatorName: string; // Added for convenience
  status: EventStatus;
  approvedBy?: number;
  approverName?: string; // Added for convenience
  approvalDate?: Date;
  revisionComments?: string;
  createdAt: Date;
  updatedAt: Date;
  // Registration information (populated when user is authenticated)
  currentAttendees?: number;
  isUserRegistered?: boolean;
  userRegistrationStatus?: 'registered' | 'waitlisted' | 'cancelled';
  isFull?: boolean;
  canRegister?: boolean;
}

// DTO for creating a new event
export interface CreateEventDto {
  title: string;
  description?: string;
  eventDate: string; // ISO 8601 date string
  eventTime: string; // HH:MM format
  eventEndDate?: string; // ISO 8601 date string - optional for multi-day events
  eventEndTime: string; // HH:MM format
  locationId: number; // Foreign key to locations table
  maxAttendees?: number;
  status?: EventStatus; // Optional, defaults to DRAFT
}

// DTO for updating an event
export interface UpdateEventDto {
  title?: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  locationId?: number; // Foreign key to locations table
  maxAttendees?: number;
  status?: EventStatus;
}

// Helper function to convert Event to EventResponse
export function toEventResponse(event: Event, creatorName: string, locationName: string, approverName?: string): EventResponse {
  return {
    ...event,
    creatorName,
    locationName,
    approverName
  };
}

// DTO for approval actions
export interface ApprovalDto {
  revisionComments?: string; // Required for revision requests, optional for approvals
}

// Validation helpers
export function isValidEventDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && Boolean(dateString.match(/^\d{4}-\d{2}-\d{2}$/));
}

export function isValidEventTime(timeString: string): boolean {
  return Boolean(timeString.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/));
}

export function isEventInPast(eventDate: string, eventTime: string, eventEndDate?: string, eventEndTime?: string): boolean {
  const now = new Date();
  // Event is in the past if its end time has passed
  if (eventEndDate && eventEndTime) {
    const endDateTime = new Date(`${eventEndDate}T${eventEndTime}`);
    return endDateTime < now;
  }
  // If no end date, check against end time on same day
  if (eventEndTime) {
    const endDateTime = new Date(`${eventDate}T${eventEndTime}`);
    return endDateTime < now;
  }
  // Fallback to start time
  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  return eventDateTime < now;
}

export function isValidEventDateRange(
  eventDate: string,
  eventTime: string,
  eventEndDate: string | undefined,
  eventEndTime: string
): boolean {
  // Validate individual date and time formats
  if (!isValidEventDate(eventDate)) return false;
  if (!isValidEventTime(eventTime)) return false;
  if (!isValidEventTime(eventEndTime)) return false;
  if (eventEndDate && !isValidEventDate(eventEndDate)) return false;

  // If no end date specified, it's a same-day event
  if (!eventEndDate) {
    // End time must be >= start time on same day
    const startDateTime = new Date(`${eventDate}T${eventTime}`);
    const endDateTime = new Date(`${eventDate}T${eventEndTime}`);
    return endDateTime >= startDateTime;
  }

  // Multi-day event: end date/time must be >= start date/time
  const startDateTime = new Date(`${eventDate}T${eventTime}`);
  const endDateTime = new Date(`${eventEndDate}T${eventEndTime}`);
  return endDateTime >= startDateTime;
}