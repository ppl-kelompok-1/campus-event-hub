export interface PasswordResetData {
  userName: string;
  resetLink: string;
  expiresAt: string; // Human-readable time like "December 1, 2025 at 5:30 PM"
}

export const passwordResetTemplate = (data: PasswordResetData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #007bff; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          margin: 20px 0;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .button:hover { background-color: #0056b3; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .warning { color: #dc3545; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Reset Request</h1>
        <p>Hi ${data.userName},</p>
        <p>We received a request to reset your password for your Campus Event Hub account.</p>

        <p>Click the button below to reset your password:</p>

        <a href="${data.resetLink}" class="button">Reset Password</a>

        <div class="info">
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire on ${data.expiresAt}</li>
            <li>The link can only be used once</li>
            <li>If you didn't request this reset, you can safely ignore this email</li>
          </ul>
        </div>

        <p class="warning">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${data.resetLink}
        </p>

        <p>Thanks,<br>Campus Event Hub Team</p>
      </div>
    </body>
    </html>
  `;
};
