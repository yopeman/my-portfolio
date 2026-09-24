import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export function createTransporter() {
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.password,
    },
  });
}

export async function sendMail(mailOptions) {
  const transporter = createTransporter();
  return transporter.sendMail(mailOptions);
}