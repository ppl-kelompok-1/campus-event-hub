import { sendEmail } from '../infrastructure/email/mailer';
import { emailConfig } from '../infrastructure/email/config';
import { eventApprovedTemplate } from '../infrastructure/email/templates/eventApproved';
import { registrationConfirmedTemplate } from '../infrastructure/email/templates/registrationConfirmed';
import { eventReminderTemplate } from '../infrastructure/email/templates/eventReminder';
import { passwordResetTemplate } from '../infrastructure/email/templates/passwordReset';
import { eventMessageTemplate } from '../infrastructure/email/templates/eventMessage';
import { eventCancelledTemplate, EventCancelledData } from '../infrastructure/email/templates/eventCancelled';
import { registrationDeadlineReminder, RegistrationDeadlineReminderData } from '../infrastructure/email/templates/registrationDeadlineReminder';
import { RegistrationStatus } from '../models/EventRegistration';
import { IEventRepository } from '../repositories/IEventRepository';
import { IUserRepository } from '../repositories/IUserRepository';
import { ILocationRepository } from '../repositories/ILocationRepository';
import { IEventRegistrationRepository } from '../repositories/IEventRegistrationRepository';

export class NotificationService {
  constructor(
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository,
    private locationRepository: ILocationRepository,
    private registrationRepository: IEventRegistrationRepository
  ) {}

  async sendEventApprovedEmail(eventId: number): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error('Event not found');

    const creator = await this.userRepository.findById(event.createdBy);
    if (!creator) throw new Error('Creator not found');

    const location = event.locationId
      ? await this.locationRepository.findById(event.locationId)
      : null;

    await sendEmail({
      to: creator.email,
      subject: `Event Approved: ${event.title}`,
      html: eventApprovedTemplate({
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        locationName: location?.name || 'TBA',
        creatorName: creator.name
      })
    });
  }

  async sendRegistrationConfirmedEmail(
    registrationId: number
  ): Promise<void> {
    const registration = await this.registrationRepository.findById(registrationId);
    if (!registration) throw new Error('Registration not found');

    const [event, user] = await Promise.all([
      this.eventRepository.findById(registration.eventId),
      this.userRepository.findById(registration.userId)
    ]);

    if (!event || !user) throw new Error('Event or user not found');

    const location = event.locationId
      ? await this.locationRepository.findById(event.locationId)
      : null;

    await sendEmail({
      to: user.email,
      subject: `Registration Confirmed: ${event.title}`,
      html: registrationConfirmedTemplate({
        userName: user.name,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        locationName: location?.name || 'TBA',
        status: registration.status as 'registered' | 'waitlisted'
      })
    });
  }

  async sendEventReminderEmails(eventId: number): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) return;

    const registrations = await this.registrationRepository.findByEventId(eventId);
    const confirmedRegistrations = registrations.filter(r => r.status === 'registered');

    const location = event.locationId
      ? await this.locationRepository.findById(event.locationId)
      : null;

    for (const registration of confirmedRegistrations) {
      const user = await this.userRepository.findById(registration.userId);
      if (!user) continue;

      await sendEmail({
        to: user.email,
        subject: `Reminder: ${event.title} Tomorrow`,
        html: eventReminderTemplate({
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          locationName: location?.name || 'TBA',
          description: event.description || 'No description provided'
        })
      });
    }
  }

  async sendEventReminderEmailsBatch(eventId: number, userIds: number[]): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) return;

    const location = event.locationId
      ? await this.locationRepository.findById(event.locationId)
      : null;

    // Get all user emails
    const users = await Promise.all(userIds.map(id => this.userRepository.findById(id)));
    const validUsers = users.filter(u => u !== null) as any[];

    if (validUsers.length === 0) return;

    console.log(`[NotificationService] Sending event attendance reminder for event ${eventId} to ${validUsers.length} recipients`);
    console.log(`[NotificationService] Event: "${event.title}"`);

    let successCount = 0;
    let failureCount = 0;

    // Send individual emails
    for (const user of validUsers) {
      try {
        await sendEmail({
          to: user.email,  // Direct "to" instead of BCC
          subject: `Reminder: ${event.title} Tomorrow`,
          html: eventReminderTemplate({
            eventTitle: event.title,
            eventDate: event.eventDate,
            eventTime: event.eventTime,
            locationName: location?.name || 'TBA',
            description: event.description || 'No description provided'
          })
        });

        console.log(`[NotificationService] ✅ Sent to: ${user.email}`);
        successCount++;
      } catch (error) {
        console.error(`[NotificationService] ❌ Failed to send to ${user.email}:`, error);
        failureCount++;
      }
    }

    console.log(`[NotificationService] ✅ Successfully sent event attendance reminder for event ${eventId}: ${successCount} succeeded, ${failureCount} failed`);
  }

  async sendEventCancelledEmail(eventId: number): Promise<void> {
    try {
      // Get event details
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        console.error(`[NotificationService] Event ${eventId} not found`);
        return;
      }

      // Get location details
      const location = event.locationId
        ? await this.locationRepository.findById(event.locationId)
        : null;

      // Get ALL registrations for the event
      const registrations = await this.registrationRepository.findByEventId(eventId);

      // Filter to ONLY registered users (exclude waitlisted and already cancelled)
      const registeredUsers = registrations.filter(
        reg => reg.status === RegistrationStatus.REGISTERED
      );

      console.log(`[NotificationService] Sending cancellation emails to ${registeredUsers.length} registered attendees for event ${eventId}`);

      // Send emails in parallel with error isolation
      const emailPromises = registeredUsers.map(async (registration) => {
        try {
          const user = await this.userRepository.findById(registration.userId);
          if (!user) {
            console.warn(`[NotificationService] User ${registration.userId} not found, skipping email`);
            return;
          }

          await sendEmail({
            to: user.email,
            subject: `Event Cancelled: ${event.title}`,
            html: eventCancelledTemplate({
              userName: user.name,
              eventTitle: event.title,
              eventDate: event.eventDate,
              eventTime: event.eventTime,
              locationName: location?.name || 'TBA'
            })
          });

          console.log(`[NotificationService] Sent cancellation email to ${user.email}`);
        } catch (error) {
          // Log but don't throw - individual email failures shouldn't affect others
          console.error(`[NotificationService] Failed to send email to user ${registration.userId}:`, error);
        }
      });

      // Wait for all emails to complete
      await Promise.allSettled(emailPromises);

      console.log(`[NotificationService] Completed sending cancellation emails for event ${eventId}`);
    } catch (error) {
      // Log the error but don't throw - email failures shouldn't block event cancellation
      console.error(`[NotificationService] Error in sendEventCancelledEmail for event ${eventId}:`, error);
    }
  }

  async sendEventMessageToAttendees(
    eventId: number,
    subject: string,
    message: string,
    senderName: string,
    userIds: number[]
  ): Promise<void> {
    // Get event details
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      console.error(`Event ${eventId} not found for message sending`);
      return;
    }

    // Get location details
    const location = event.locationId
      ? await this.locationRepository.findById(event.locationId)
      : null;

    // Send individual emails to each attendee
    for (const userId of userIds) {
      try {
        const user = await this.userRepository.findById(userId);
        if (!user) {
          console.warn(`User ${userId} not found, skipping email`);
          continue;
        }

        await sendEmail({
          to: user.email,
          subject: `[${event.title}] ${subject}`,
          html: eventMessageTemplate({
            userName: user.name,
            eventTitle: event.title,
            subject: subject,
            message: message,
            senderName: senderName,
            eventDate: event.eventDate,
            eventTime: event.eventTime,
            locationName: location?.name || 'TBA'
          })
        });
      } catch (error) {
        console.error(`Failed to send message email to user ${userId}:`, error);
        // Continue with other users even if one fails
      }
    }
  }

  async sendPasswordResetEmail(userId: number, token: string): Promise<void> {
    // 1. Fetch user
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // 2. Generate reset link (use environment variable for base URL)
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // 3. Calculate human-readable expiry time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const expiresAtFormatted = expiresAt.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // 4. Send email
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Campus Event Hub',
      html: passwordResetTemplate({
        userName: user.name,
        resetLink,
        expiresAt: expiresAtFormatted
      })
    });
  }

  async sendRegistrationDeadlineReminder(eventId: number, userId: number): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const emailData: RegistrationDeadlineReminderData = {
      eventTitle: event.title,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      registrationEndDate: event.registrationEndDate,
      registrationEndTime: event.registrationEndTime,
      eventUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/events/${event.id}`
    };

    await sendEmail({
      to: user.email,
      subject: `Registration Closing Soon: ${event.title}`,
      html: registrationDeadlineReminder(emailData)
    });
  }

  async sendRegistrationDeadlineReminderBatch(eventId: number, userIds: number[]): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    // Get all user emails
    const users = await Promise.all(userIds.map(id => this.userRepository.findById(id)));
    const validUsers = users.filter(u => u !== null) as any[];

    if (validUsers.length === 0) return;

    console.log(`[NotificationService] Sending registration deadline reminder for event ${eventId} to ${validUsers.length} recipients`);
    console.log(`[NotificationService] Event: "${event.title}"`);
    console.log(`[NotificationService] Registration closes: ${event.registrationEndDate} at ${event.registrationEndTime}`);

    const emailData: RegistrationDeadlineReminderData = {
      eventTitle: event.title,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      registrationEndDate: event.registrationEndDate,
      registrationEndTime: event.registrationEndTime,
      eventUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/events/${event.id}`
    };

    let successCount = 0;
    let failureCount = 0;

    // Send individual emails
    for (const user of validUsers) {
      try {
        await sendEmail({
          to: user.email,  // Direct "to" instead of BCC
          subject: `Registration Closing Soon: ${event.title}`,
          html: registrationDeadlineReminder(emailData)
        });

        console.log(`[NotificationService] ✅ Sent to: ${user.email}`);
        successCount++;
      } catch (error) {
        console.error(`[NotificationService] ❌ Failed to send to ${user.email}:`, error);
        failureCount++;
      }
    }

    console.log(`[NotificationService] ✅ Successfully sent registration deadline reminder for event ${eventId}: ${successCount} succeeded, ${failureCount} failed`);
  }
}
