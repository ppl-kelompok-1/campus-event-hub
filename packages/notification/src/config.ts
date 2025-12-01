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

const getConfig = (): EmailConfig => {
  // Validate required environment variables
  const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS'];
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Support both service-based (Gmail) and host/port based SMTP
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
    throw new Error('Either SMTP_SERVICE or both SMTP_HOST and SMTP_PORT must be provided');
  }

  return {
    smtp: smtpConfig,
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Campus Event Hub',
      address: process.env.EMAIL_FROM_ADDRESS || 'noreply@campus-event-hub.local'
    }
  };
};

export const config = getConfig();
