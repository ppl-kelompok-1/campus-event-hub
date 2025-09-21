// Registration status enum
export enum RegistrationStatus {
  REGISTERED = 'registered',
  CANCELLED = 'cancelled',
  WAITLISTED = 'waitlisted'
}

// Domain model for EventRegistration entity
export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  registrationDate: Date;
  status: RegistrationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Event registration response with user info for API responses
export interface EventRegistrationResponse {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  userEmail: string;
  registrationDate: Date;
  status: RegistrationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new registration
export interface CreateRegistrationDto {
  eventId: number;
  userId: number;
  status?: RegistrationStatus; // Optional, defaults to REGISTERED
}

// DTO for updating a registration
export interface UpdateRegistrationDto {
  status?: RegistrationStatus;
}

// Registration statistics for events
export interface EventRegistrationStats {
  eventId: number;
  totalRegistered: number;
  totalWaitlisted: number;
  totalCancelled: number;
  maxAttendees?: number;
  isFull: boolean;
}

// Helper function to convert EventRegistration to EventRegistrationResponse
export function toEventRegistrationResponse(
  registration: EventRegistration, 
  userName: string, 
  userEmail: string
): EventRegistrationResponse {
  return {
    ...registration,
    userName,
    userEmail
  };
}

// Validation helpers
export function isValidRegistrationStatus(status: string): status is RegistrationStatus {
  return Object.values(RegistrationStatus).includes(status as RegistrationStatus);
}

// Business logic helpers
export function canRegisterForEvent(
  currentAttendees: number, 
  maxAttendees?: number
): boolean {
  if (!maxAttendees) return true; // No limit set
  return currentAttendees < maxAttendees;
}

export function shouldWaitlist(
  currentAttendees: number, 
  maxAttendees?: number
): boolean {
  if (!maxAttendees) return false; // No limit set
  return currentAttendees >= maxAttendees;
}