import nodemailer from 'nodemailer';
import logger from './logger.js';

import { isPlaceholder } from './isPlaceholder.js';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  if (isPlaceholder(host)) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    ...(process.env.SMTP_TLS_INSECURE === 'true' && {
      tls: { rejectUnauthorized: false }
    })
  });
};

export const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

  if (!transporter) {
    logger.warn(`SMTP not configured. Verification link for ${email}: ${verifyUrl}`);
    return { sent: false, verifyUrl };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'VJ Fashions <noreply@vjfashions.com>',
      to: email,
      subject: 'Verify your VJ Fashions account',
      html: `
        <h2>Welcome to VJ Fashions!</h2>
        <p>Click the link below to verify your email and start commenting on products.</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link expires in 24 hours.</p>
      `
    });
    logger.info(`Verification email sent to ${email}`);
    return { sent: true };
  } catch (err) {
    logger.warn(`Email send failed for ${email}: ${err.message}. Dev link: ${verifyUrl}`);
    return { sent: false, verifyUrl };
  }
};
