import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from './config';

const transporter: Transporter = nodemailer.createTransport(config.smtp);

// Kirim email
const sendEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: `"${config.from.name}" <${config.from.address}>`,
      to: 'rrxpeygnmnwajukiiv@enotj.com',
      subject: 'Subjek Email',
      text: 'Halo BROOO',
    });

    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error:', error);
  }
};

sendEmail();
