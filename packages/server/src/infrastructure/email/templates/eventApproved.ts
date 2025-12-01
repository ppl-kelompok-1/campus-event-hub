export interface EventApprovedData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  creatorName: string;
}

export const eventApprovedTemplate = (data: EventApprovedData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #28a745; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Your Event Has Been Approved!</h1>
        <p>Great news, ${data.creatorName}!</p>
        <p>Your event "<strong>${data.eventTitle}</strong>" has been approved and is now published.</p>

        <div class="info">
          <p><strong>Date:</strong> ${data.eventDate} at ${data.eventTime}</p>
          <p><strong>Location:</strong> ${data.locationName}</p>
        </div>

        <p>Students and staff can now register for your event.</p>
      </div>
    </body>
    </html>
  `;
};
