import { IEventRegistrationRepository } from '../repositories/IEventRegistrationRepository';
import { IEventRepository } from '../repositories/IEventRepository';
import { IUserRepository } from '../repositories/IUserRepository';
import { EventRegistration, CreateRegistrationDto, UpdateRegistrationDto, EventRegistrationResponse, RegistrationStatus, toEventRegistrationResponse, canRegisterForEvent, shouldWaitlist } from '../models/EventRegistration';
import { EventStatus, isEventInPast, validateUserCategoryForEvent } from '../models/Event';
import { UserRole } from '../models/User';

export class EventRegistrationService {
  constructor(
    private eventRegistrationRepository: IEventRegistrationRepository,
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository
  ) {}

  // Register a user for an event
  async registerForEvent(eventId: number, userId: number, userRole: UserRole): Promise<EventRegistrationResponse> {
    // Validate that the event exists and is available for registration
    await this.validateEventForRegistration(eventId);

    // Get event to check category restrictions
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get user to check category
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate user category for event
    if (!validateUserCategoryForEvent(user.category, event.allowedCategories)) {
      const allowedCats = event.allowedCategories?.join(', ') || 'none';
      throw new Error(
        `This event is restricted to ${allowedCats} categories. Your category (${user.category}) is not allowed to register.`
      );
    }

    // Check if user is already registered
    const existingRegistration = await this.eventRegistrationRepository.findByEventAndUser(eventId, userId);
    if (existingRegistration) {
      if (existingRegistration.status === RegistrationStatus.REGISTERED) {
        throw new Error('User is already registered for this event');
      } else if (existingRegistration.status === RegistrationStatus.WAITLISTED) {
        throw new Error('User is already on the waitlist for this event');
      } else if (existingRegistration.status === RegistrationStatus.CANCELLED) {
        // Reactivate cancelled registration
        const updated = await this.eventRegistrationRepository.update(existingRegistration.id, {
          status: RegistrationStatus.REGISTERED
        });
        if (!updated) {
          throw new Error('Failed to reactivate registration');
        }
        return this.enrichRegistrationWithUserInfo(updated);
      }
    }

    // Check event capacity and determine registration status
    const currentAttendees = await this.eventRegistrationRepository.getRegistrationCountByStatus(eventId, RegistrationStatus.REGISTERED);
    
    let registrationStatus = RegistrationStatus.REGISTERED;
    if (event.maxAttendees && shouldWaitlist(currentAttendees, event.maxAttendees)) {
      registrationStatus = RegistrationStatus.WAITLISTED;
    }

    // Create registration
    const registrationData: CreateRegistrationDto = {
      eventId,
      userId,
      status: registrationStatus
    };

    const registration = await this.eventRegistrationRepository.create(registrationData);
    return this.enrichRegistrationWithUserInfo(registration);
  }

  // Unregister a user from an event
  async unregisterFromEvent(eventId: number, userId: number, userRole: UserRole): Promise<boolean> {
    // Check if user is registered
    const registration = await this.eventRegistrationRepository.findByEventAndUser(eventId, userId);
    if (!registration) {
      throw new Error('User is not registered for this event');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new Error('Registration is already cancelled');
    }

    // Validate that the event allows unregistration
    await this.validateEventForUnregistration(eventId);

    // Cancel the registration
    const updated = await this.eventRegistrationRepository.update(registration.id, {
      status: RegistrationStatus.CANCELLED
    });

    if (!updated) {
      throw new Error('Failed to cancel registration');
    }

    // If this was a registered user and there are waitlisted users, promote one
    if (registration.status === RegistrationStatus.REGISTERED) {
      await this.promoteFromWaitlist(eventId);
    }

    return true;
  }

  // Get all registrations for an event (for event creators/admins)
  async getEventRegistrations(eventId: number, requestingUserId: number, userRole: UserRole): Promise<EventRegistrationResponse[]> {
    // Check permissions - only event creator or admin can see attendee list
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPERADMIN) {
      const event = await this.eventRepository.findById(eventId);
      if (!event || event.createdBy !== requestingUserId) {
        throw new Error('Insufficient permissions to view event registrations');
      }
    }

    const registrations = await this.eventRegistrationRepository.findByEventId(eventId);
    return Promise.all(registrations.map(reg => this.enrichRegistrationWithUserInfo(reg)));
  }

  // Get user's joined events
  async getUserJoinedEvents(userId: number): Promise<EventRegistrationResponse[]> {
    const registrations = await this.eventRegistrationRepository.findByUserId(userId);
    // Only return active registrations (registered or waitlisted)
    const activeRegistrations = registrations.filter(reg => 
      reg.status === RegistrationStatus.REGISTERED || reg.status === RegistrationStatus.WAITLISTED
    );
    return Promise.all(activeRegistrations.map(reg => this.enrichRegistrationWithUserInfo(reg)));
  }

  // Check if user is registered for an event
  async isUserRegisteredForEvent(eventId: number, userId: number): Promise<{
    isRegistered: boolean;
    status?: RegistrationStatus;
  }> {
    const registration = await this.eventRegistrationRepository.findByEventAndUser(eventId, userId);
    
    if (!registration || registration.status === RegistrationStatus.CANCELLED) {
      return { isRegistered: false };
    }

    return {
      isRegistered: true,
      status: registration.status
    };
  }

  // Get registration statistics for an event
  async getEventRegistrationStats(eventId: number): Promise<{
    totalRegistered: number;
    totalWaitlisted: number;
    totalCancelled: number;
    maxAttendees?: number;
    isFull: boolean;
    canRegister: boolean;
  }> {
    const stats = await this.eventRegistrationRepository.getEventRegistrationStats(eventId);
    const event = await this.eventRepository.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    const isFull = event.maxAttendees ? stats.totalRegistered >= event.maxAttendees : false;
    const canRegister = !isFull && event.status === EventStatus.PUBLISHED && !isEventInPast(event.eventDate, event.eventTime);

    return {
      ...stats,
      maxAttendees: event.maxAttendees,
      isFull,
      canRegister
    };
  }

  // Get public attendee list for an event (only shows names)
  async getEventAttendees(eventId: number): Promise<{
    id: number;
    userId: number;
    userName: string;
    registrationDate: string;
  }[]> {
    // Verify event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get all registrations for this event
    const registrations = await this.eventRegistrationRepository.findByEventId(eventId);
    
    // Filter to only registered attendees (not waitlisted or cancelled)
    const registeredAttendees = registrations.filter(reg => 
      reg.status === RegistrationStatus.REGISTERED
    );

    // Map to public attendee information (name only, no email)
    return Promise.all(registeredAttendees.map(async (reg) => {
      const userName = await this.eventRegistrationRepository.getUserName(reg.userId);
      
      if (!userName) {
        throw new Error('Failed to get user information for registration');
      }

      return {
        id: reg.id,
        userId: reg.userId,
        userName,
        registrationDate: reg.registrationDate.toISOString()
      };
    }));
  }

  async exportAttendeesToCSV(eventId: number): Promise<string> {
    // Verify event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get all registrations for this event
    const registrations = await this.eventRegistrationRepository.findByEventId(eventId);

    if (!registrations || registrations.length === 0) {
      // Return empty CSV with headers
      return 'User ID,Name,Email,Registered At,Status\n';
    }

    // Create CSV content
    const header = 'User ID,Name,Email,Registered At,Status\n';

    const rows = await Promise.all(registrations.map(async (reg) => {
      // Get user details
      const user = await this.userRepository.findById(reg.userId);
      if (!user) {
        return null; // Skip if user not found
      }

      const name = user.name.replace(/"/g, '""'); // Escape quotes
      const email = user.email.replace(/"/g, '""');
      const registeredAt = reg.registrationDate.toLocaleString();
      return `${user.id},"${name}","${email}","${registeredAt}",${reg.status}`;
    }));

    // Filter out nulls and join
    const validRows = rows.filter(row => row !== null);
    return header + validRows.join('\n');
  }

  // Private helper methods

  private async validateEventForRegistration(eventId: number): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new Error('Event is not available for registration');
    }

    if (isEventInPast(event.eventDate, event.eventTime)) {
      throw new Error('Cannot register for past events');
    }
  }

  private async validateEventForUnregistration(eventId: number): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Allow unregistration even for past events, but maybe add a warning
    // For now, we'll allow it to be flexible
  }

  private async promoteFromWaitlist(eventId: number): Promise<void> {
    // Find the earliest waitlisted registration
    const waitlistedRegistrations = await this.eventRegistrationRepository.findByEventId(eventId);
    const waitlisted = waitlistedRegistrations
      .filter(reg => reg.status === RegistrationStatus.WAITLISTED)
      .sort((a, b) => a.registrationDate.getTime() - b.registrationDate.getTime())[0];

    if (waitlisted) {
      await this.eventRegistrationRepository.update(waitlisted.id, {
        status: RegistrationStatus.REGISTERED
      });
    }
  }

  private async enrichRegistrationWithUserInfo(registration: EventRegistration): Promise<EventRegistrationResponse> {
    const userName = await this.eventRegistrationRepository.getUserName(registration.userId);
    const userEmail = await this.eventRegistrationRepository.getUserEmail(registration.userId);
    
    if (!userName || !userEmail) {
      throw new Error('Failed to get user information for registration');
    }

    return toEventRegistrationResponse(registration, userName, userEmail);
  }
}