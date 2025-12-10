import nodemailer from 'nodemailer';
import { emailConfig } from './config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  bcc?: string | string[];
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport(emailConfig.smtp);

  await transporter.sendMail({
    from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
    subject: options.subject,
    text: options.text,
    html: options.html
  });
};
