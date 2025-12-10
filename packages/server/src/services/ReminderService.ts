import { IEventRepository } from '../repositories/IEventRepository';
import { IEventRegistrationRepository } from '../repositories/IEventRegistrationRepository';
import { IUserRepository } from '../repositories/IUserRepository';
import { IReminderLogRepository, ReminderType } from '../repositories/IReminderLogRepository';
import { NotificationService } from './NotificationService';
import { Event, EventStatus } from '../models/Event';

export class ReminderService {
  constructor(
    private eventRepository: IEventRepository,
    private eventRegistrationRepository: IEventRegistrationRepository,
    private userRepository: IUserRepository,
    private reminderLogRepository: IReminderLogRepository,
    private notificationService: NotificationService
  ) {}

  /**
   * Check and send event attendance reminders
   * Called by cron job every hour
   */
  async sendEventAttendanceReminders(): Promise<void> {
    try {
      console.log('[ReminderService] Checking for event attendance reminders...');

      // Find events starting in approximately 24 hours (23-25 hour window)
      const events = await this.findEventsStartingIn24Hours();

      console.log(`[ReminderService] Found ${events.length} events needing attendance reminders`);

      for (const event of events) {
        await this.processEventAttendanceReminder(event);
      }

      console.log('[ReminderService] Event attendance reminder check complete');
    } catch (error) {
      console.error('[ReminderService] Error in sendEventAttendanceReminders:', error);
    }
  }

  /**
   * Check and send registration deadline reminders
   * Called by cron job every hour
   */
  async sendRegistrationDeadlineReminders(): Promise<void> {
    try {
      console.log('[ReminderService] Checking for registration deadline reminders...');

      // Find events with registration ending in approximately 24 hours
      const events = await this.findEventsWithRegistrationEndingIn24Hours();

      console.log(`[ReminderService] Found ${events.length} events needing deadline reminders`);

      for (const event of events) {
        await this.processRegistrationDeadlineReminder(event);
      }

      console.log('[ReminderService] Registration deadline reminder check complete');
    } catch (error) {
      console.error('[ReminderService] Error in sendRegistrationDeadlineReminders:', error);
    }
  }

  private async findEventsStartingIn24Hours(): Promise<Event[]> {
    // Get all published events
    const allEvents = await this.eventRepository.findByStatus(EventStatus.PUBLISHED);

    const now = new Date();
    // 23 hours 45 minutes = 23 * 60 + 45 = 1425 minutes
    const twentyThreeHours45MinFromNow = new Date(now.getTime() + 1425 * 60 * 1000);
    // 24 hours 15 minutes = 24 * 60 + 15 = 1455 minutes
    const twentyFourHours15MinFromNow = new Date(now.getTime() + 1455 * 60 * 1000);

    // Filter events starting in the 23.75-24.25 hour window (30 minute window for 5-minute checks)
    return allEvents.filter(event => {
      const eventDateTime = this.parseEventDateTime(event.eventDate, event.eventTime);
      return eventDateTime >= twentyThreeHours45MinFromNow && eventDateTime <= twentyFourHours15MinFromNow;
    });
  }

  private async findEventsWithRegistrationEndingIn24Hours(): Promise<Event[]> {
    const allEvents = await this.eventRepository.findByStatus(EventStatus.PUBLISHED);

    const now = new Date();
    // 23 hours 45 minutes = 23 * 60 + 45 = 1425 minutes
    const twentyThreeHours45MinFromNow = new Date(now.getTime() + 1425 * 60 * 1000);
    // 24 hours 15 minutes = 24 * 60 + 15 = 1455 minutes
    const twentyFourHours15MinFromNow = new Date(now.getTime() + 1455 * 60 * 1000);

    // Filter events with registration ending in the 23.75-24.25 hour window (30 minute window for 5-minute checks)
    return allEvents.filter(event => {
      const regEndDateTime = this.parseEventDateTime(event.registrationEndDate, event.registrationEndTime);
      return regEndDateTime >= twentyThreeHours45MinFromNow && regEndDateTime <= twentyFourHours15MinFromNow;
    });
  }

  private async processEventAttendanceReminder(event: Event): Promise<void> {
    try {
      // Get all registered users for this event
      const registrations = await this.eventRegistrationRepository.findByEventId(event.id);
      const registeredUsers = registrations.filter(reg => reg.status === 'registered');

      console.log(`[ReminderService] Processing attendance reminder for event ${event.id}: ${registeredUsers.length} registered users`);

      // Check if reminder already sent for this event (batch approach)
      const alreadySent = await this.reminderLogRepository.hasReminderBeenSent(
        event.id,
        null,  // null = sent to all registered users as batch
        ReminderType.EVENT_ATTENDANCE
      );

      if (alreadySent) {
        console.log(`[ReminderService] Skipping duplicate attendance reminder for event ${event.id}`);
        return;
      }

      if (registeredUsers.length > 0) {
        // Send ONE email to all registered users via BCC
        await this.notificationService.sendEventReminderEmailsBatch(
          event.id,
          registeredUsers.map(r => r.userId)
        );

        // Log the reminder (one log for the entire event)
        await this.reminderLogRepository.createLog(
          event.id,
          null,
          ReminderType.EVENT_ATTENDANCE
        );

        console.log(`[ReminderService] Sent attendance reminder for event ${event.id} to ${registeredUsers.length} users via BCC`);
      }
    } catch (error) {
      console.error(`[ReminderService] Error processing attendance reminder for event ${event.id}:`, error);
    }
  }

  private async processRegistrationDeadlineReminder(event: Event): Promise<void> {
    try {
      // Check if we've already sent this reminder
      const alreadySent = await this.reminderLogRepository.hasReminderBeenSent(
        event.id,
        null, // null = sent to all users
        ReminderType.REGISTRATION_DEADLINE
      );

      if (alreadySent) {
        console.log(`[ReminderService] Skipping duplicate deadline reminder for event ${event.id}`);
        return;
      }

      // Get all users who haven't registered yet
      const allUsers = await this.userRepository.findAll();
      const registrations = await this.eventRegistrationRepository.findByEventId(event.id);
      const registeredUserIds = new Set(registrations.map(r => r.userId));

      const unregisteredUsers = allUsers.filter(user => !registeredUserIds.has(user.id));

      console.log(`[ReminderService] Sending deadline reminder for event ${event.id} to ${unregisteredUsers.length} unregistered users`);

      if (unregisteredUsers.length > 0) {
        // Send ONE email to all unregistered users via BCC
        await this.notificationService.sendRegistrationDeadlineReminderBatch(
          event.id,
          unregisteredUsers.map(u => u.id)
        );

        // Log that we sent this reminder (one log for the entire event)
        await this.reminderLogRepository.createLog(
          event.id,
          null,
          ReminderType.REGISTRATION_DEADLINE
        );

        console.log(`[ReminderService] Deadline reminder sent for event ${event.id} to ${unregisteredUsers.length} users via BCC`);
      }
    } catch (error) {
      console.error(`[ReminderService] Error processing deadline reminder for event ${event.id}:`, error);
    }
  }

  private parseEventDateTime(dateStr: string, timeStr: string): Date {
    // dateStr format: YYYY-MM-DD
    // timeStr format: HH:MM
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    return new Date(year, month - 1, day, hours, minutes);
  }
}
