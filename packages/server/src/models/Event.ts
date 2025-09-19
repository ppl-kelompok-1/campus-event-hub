// Event status enum
export enum EventStatus {
  DRAFT = 'draft',
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
  location: string;
  maxAttendees?: number;
  createdBy: number; // User ID
  status: EventStatus;
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
  location: string;
  maxAttendees?: number;
  createdBy: number;
  creatorName: string; // Added for convenience
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new event
export interface CreateEventDto {
  title: string;
  description?: string;
  eventDate: string; // ISO 8601 date string
  eventTime: string; // HH:MM format
  location: string;
  maxAttendees?: number;
  status?: EventStatus; // Optional, defaults to DRAFT
}

// DTO for updating an event
export interface UpdateEventDto {
  title?: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  maxAttendees?: number;
  status?: EventStatus;
}

// Helper function to convert Event to EventResponse
export function toEventResponse(event: Event, creatorName: string): EventResponse {
  return {
    ...event,
    creatorName
  };
}

// Validation helpers
export function isValidEventDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && Boolean(dateString.match(/^\d{4}-\d{2}-\d{2}$/));
}

export function isValidEventTime(timeString: string): boolean {
  return Boolean(timeString.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/));
}

export function isEventInPast(eventDate: string, eventTime: string): boolean {
  const now = new Date();
  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  return eventDateTime < now;
}