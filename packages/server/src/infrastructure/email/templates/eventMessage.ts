export interface EventMessageData {
  userName: string;
  eventTitle: string;
  subject: string;
  message: string;
  senderName: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
}

// HTML escape function to prevent XSS attacks
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export const eventMessageTemplate = (data: EventMessageData): string => {
  // Escape all user-generated content
  const escapedUserName = escapeHtml(data.userName);
  const escapedEventTitle = escapeHtml(data.eventTitle);
  const escapedSubject = escapeHtml(data.subject);
  const escapedMessage = escapeHtml(data.message);
  const escapedSenderName = escapeHtml(data.senderName);
  const escapedLocationName = escapeHtml(data.locationName);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #007bff; margin-bottom: 10px; }
        h2 { color: #333; margin-top: 20px; margin-bottom: 10px; font-size: 18px; }
        .message-box {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 5px;
          border-left: 4px solid #007bff;
          margin: 20px 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .event-info {
          background: #e9ecef;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .event-info p { margin: 5px 0; }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Message from Event Organizer</h1>

        <p>Hi ${escapedUserName},</p>

        <p>You have received a message from the organizer of "<strong>${escapedEventTitle}</strong>":</p>

        <h2>${escapedSubject}</h2>

        <div class="message-box">${escapedMessage}</div>

        <p><em>Sent by: ${escapedSenderName}</em></p>

        <div class="event-info">
          <p><strong>Event:</strong> ${escapedEventTitle}</p>
          <p><strong>Date:</strong> ${data.eventDate} at ${data.eventTime}</p>
          <p><strong>Location:</strong> ${escapedLocationName}</p>
        </div>

        <div class="footer">
          <p>This is an automated message from Campus Event Hub.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
