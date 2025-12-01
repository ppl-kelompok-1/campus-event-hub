export interface EventCancelledData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
}

export const eventCancelledTemplate = (data: EventCancelledData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #dc3545; border-bottom: 3px solid #dc3545; padding-bottom: 10px; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info p { margin: 5px 0; }
        .apology { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
        .footer { color: #6c757d; font-size: 0.9em; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Event Cancelled</h1>
        <p>Hi ${data.userName},</p>
        <p>We regret to inform you that the following event has been cancelled:</p>

        <div class="info">
          <p><strong>Event:</strong> ${data.eventTitle}</p>
          <p><strong>Scheduled Date:</strong> ${data.eventDate} at ${data.eventTime}</p>
          <p><strong>Location:</strong> ${data.locationName}</p>
        </div>

        <div class="apology">
          <p><strong>We apologize for any inconvenience this may cause.</strong></p>
        </div>

        <p>Your registration for this event has been automatically cancelled. No further action is required on your part.</p>

        <p>Feel free to browse other upcoming events that might interest you on Campus Event Hub.</p>

        <div class="footer">
          <p>Campus Event Hub Notification System</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
