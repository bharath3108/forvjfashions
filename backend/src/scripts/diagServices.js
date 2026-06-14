import 'dotenv/config';
import { getRedis } from '../config/redis.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import fs from 'fs';

const r = { cloudinary: isCloudinaryConfigured() };

try {
  const opts = {};
  if (process.env.MONGODB_TLS_INSECURE === 'true') opts.tlsAllowInvalidCertificates = true;
  await mongoose.connect(process.env.MONGODB_URI, opts);
  r.mongo = true;
  await mongoose.disconnect();
} catch (e) {
  r.mongo_err = e.message;
}

try {
  const client = getRedis();
  if (client) {
    await client.ping();
    r.redis = true;
  } else {
    r.redis = false;
    r.redis_err = 'Redis not configured';
  }
} catch (e) {
  r.redis_err = e.message;
}

try {
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    ...(process.env.SMTP_TLS_INSECURE === 'true' && {
      tls: { rejectUnauthorized: false }
    })
  });
  await t.verify();
  r.smtp = true;
} catch (e) {
  r.smtp_err = e.message;
}

fs.writeFileSync('diag2.json', JSON.stringify(r));
process.exit(r.mongo && r.redis && r.cloudinary && r.smtp ? 0 : 1);
