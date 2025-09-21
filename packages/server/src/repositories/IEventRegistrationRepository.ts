import { EventRegistration, CreateRegistrationDto, UpdateRegistrationDto, RegistrationStatus } from '../models/EventRegistration';

export interface IEventRegistrationRepository {
  // Create a new registration
  create(registrationData: CreateRegistrationDto): Promise<EventRegistration>;
  
  // Find registration by ID
  findById(id: number): Promise<EventRegistration | null>;
  
  // Find registration by event and user
  findByEventAndUser(eventId: number, userId: number): Promise<EventRegistration | null>;
  
  // Find all registrations for an event
  findByEventId(eventId: number): Promise<EventRegistration[]>;
  
  // Find all registrations for a user
  findByUserId(userId: number): Promise<EventRegistration[]>;
  
  // Update registration
  update(id: number, updateData: UpdateRegistrationDto): Promise<EventRegistration | null>;
  
  // Delete registration
  delete(id: number): Promise<boolean>;
  
  // Delete registration by event and user
  deleteByEventAndUser(eventId: number, userId: number): Promise<boolean>;
  
  // Get count of registrations by status for an event
  getRegistrationCountByStatus(eventId: number, status: RegistrationStatus): Promise<number>;
  
  // Get total active registrations for an event (registered + waitlisted)
  getActiveRegistrationCount(eventId: number): Promise<number>;
  
  // Get registration statistics for an event
  getEventRegistrationStats(eventId: number): Promise<{
    totalRegistered: number;
    totalWaitlisted: number;
    totalCancelled: number;
  }>;
  
  // Get user name for a registration (for response enrichment)
  getUserName(userId: number): Promise<string | null>;
  
  // Get user email for a registration (for response enrichment)
  getUserEmail(userId: number): Promise<string | null>;
  
  // Check if user is registered for event (any status)
  isUserRegistered(eventId: number, userId: number): Promise<boolean>;
  
  // Check if user has active registration (registered or waitlisted)
  hasActiveRegistration(eventId: number, userId: number): Promise<boolean>;
}