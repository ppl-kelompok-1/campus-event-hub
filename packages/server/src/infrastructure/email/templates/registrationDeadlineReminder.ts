export interface RegistrationDeadlineReminderData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  registrationEndDate: string;
  registrationEndTime: string;
  eventUrl: string;
}

export const registrationDeadlineReminder = (data: RegistrationDeadlineReminderData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Registration Closing Soon!</h2>

        <p>Hi there,</p>

        <p>This is a friendly reminder that registration for <strong>${data.eventTitle}</strong> will close in 24 hours.</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Event:</strong> ${data.eventTitle}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${data.eventDate} at ${data.eventTime}</p>
          <p style="margin: 5px 0;"><strong>Registration Closes:</strong> ${data.registrationEndDate} at ${data.registrationEndTime}</p>
        </div>

        <p>Don't miss out! Register now to secure your spot.</p>

        <div style="margin: 30px 0;">
          <a href="${data.eventUrl}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Register Now
          </a>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          Campus Event Hub Team
        </p>
      </div>
    </body>
    </html>
  `;
};
