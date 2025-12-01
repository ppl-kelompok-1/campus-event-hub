import { sendEmail } from '../infrastructure/email/mailer';
import { eventApprovedTemplate } from '../infrastructure/email/templates/eventApproved';
import { registrationConfirmedTemplate } from '../infrastructure/email/templates/registrationConfirmed';
import { eventReminderTemplate } from '../infrastructure/email/templates/eventReminder';
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
}
