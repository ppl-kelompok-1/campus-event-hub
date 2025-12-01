import { sendEmail } from '../infrastructure/email/mailer';
import { eventApprovedTemplate } from '../infrastructure/email/templates/eventApproved';
import { registrationConfirmedTemplate } from '../infrastructure/email/templates/registrationConfirmed';
import { eventReminderTemplate } from '../infrastructure/email/templates/eventReminder';
import { passwordResetTemplate } from '../infrastructure/email/templates/passwordReset';
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
          userName: user.name,
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          locationName: location?.name || 'TBA',
          description: event.description || 'No description provided'
        })
      });
    }
  }

  async sendEventCancelledEmail(eventId: number): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) return;

    const registrations = await this.registrationRepository.findByEventId(eventId);

    for (const registration of registrations) {
      const user = await this.userRepository.findById(registration.userId);
      if (!user) continue;

      await sendEmail({
        to: user.email,
        subject: `Event Cancelled: ${event.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              h1 { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Event Cancelled</h1>
              <p>Hi ${user.name},</p>
              <p>Unfortunately, the event "<strong>${event.title}</strong>" scheduled for ${event.eventDate} has been cancelled.</p>
              <p>We apologize for any inconvenience.</p>
            </div>
          </body>
          </html>
        `
      });
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
}
