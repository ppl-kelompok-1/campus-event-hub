import nodemailer from 'nodemailer';
import { emailConfig } from './config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport(emailConfig.smtp);

  await transporter.sendMail({
    from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });
};
