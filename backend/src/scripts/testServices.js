import 'dotenv/config';
import { getRedis } from '../config/redis.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import fs from 'fs';

const results = { mongo: false, redis: false, cloudinary: false, smtp: false };

try {
  const opts = {};
  if (process.env.MONGODB_TLS_INSECURE === 'true') opts.tlsAllowInvalidCertificates = true;
  await mongoose.connect(process.env.MONGODB_URI, opts);
  results.mongo = true;
  await mongoose.disconnect();
} catch {}

try {
  const r = getRedis();
  if (r) { await r.ping(); results.redis = true; }
} catch {}

results.cloudinary = isCloudinaryConfigured();

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
  results.smtp = true;
} catch {}

fs.writeFileSync('test-services-result.json', JSON.stringify(results));
process.exit(Object.values(results).every(Boolean) ? 0 : 1);
