export interface EventReminderData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  description: string;
}

export const eventReminderTemplate = (data: EventReminderData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #ff6f00; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Event Reminder: ${data.eventTitle}</h1>
        <p>Hi ${data.userName},</p>
        <p>This is a reminder that you're registered for an event happening tomorrow!</p>

        <div class="info">
          <p><strong>Event:</strong> ${data.eventTitle}</p>
          <p><strong>Date:</strong> ${data.eventDate} at ${data.eventTime}</p>
          <p><strong>Location:</strong> ${data.locationName}</p>
          <p><strong>Description:</strong> ${data.description}</p>
        </div>

        <p>See you there!</p>
      </div>
    </body>
    </html>
  `;
};
