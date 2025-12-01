export interface RegistrationConfirmedData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  status: 'registered' | 'waitlisted';
}

export const registrationConfirmedTemplate = (data: RegistrationConfirmedData): string => {
  const isWaitlisted = data.status === 'waitlisted';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: ${isWaitlisted ? '#ffc107' : '#007bff'}; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${isWaitlisted ? 'Added to Waitlist' : 'Registration Confirmed'}</h1>
        <p>Hi ${data.userName},</p>
        <p>You have been ${isWaitlisted ? 'added to the waitlist for' : 'registered for'} "<strong>${data.eventTitle}</strong>".</p>

        <div class="info">
          <p><strong>Date:</strong> ${data.eventDate} at ${data.eventTime}</p>
          <p><strong>Location:</strong> ${data.locationName}</p>
        </div>

        ${isWaitlisted
          ? '<p>You will be notified if a spot becomes available.</p>'
          : '<p>We look forward to seeing you there!</p>'
        }
      </div>
    </body>
    </html>
  `;
};
