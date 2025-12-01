import 'dotenv/config';

interface EmailConfig {
  smtp: {
    service?: string;
    host?: string;
    port?: number;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    address: string;
  };
}

const getEmailConfig = (): EmailConfig => {
  const requiredVars = ['SMTP_USER', 'SMTP_PASS'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing email config: ${missing.join(', ')}`);
  }

  const smtpConfig: EmailConfig['smtp'] = {
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!
    }
  };

  if (process.env.SMTP_SERVICE) {
    smtpConfig.service = process.env.SMTP_SERVICE;
  } else if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    smtpConfig.host = process.env.SMTP_HOST;
    smtpConfig.port = parseInt(process.env.SMTP_PORT);
  } else {
    throw new Error('Either SMTP_SERVICE or SMTP_HOST+PORT required');
  }

  return {
    smtp: smtpConfig,
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Campus Event Hub',
      address: process.env.EMAIL_FROM_ADDRESS || 'noreply@campus-event-hub.local'
    }
  };
};

export const emailConfig = getEmailConfig();
