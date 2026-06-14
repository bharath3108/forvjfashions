import 'dotenv/config';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import logger from '../utils/logger.js';

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';

const seed = async () => {
  await connectDB();
  const exists = await Admin.findOne({ username });
  if (exists) {
    logger.info(`Admin "${username}" already exists`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  await Admin.create({ username, password: hashed });
  logger.info(`Admin "${username}" created successfully`);
  process.exit(0);
};

seed().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
