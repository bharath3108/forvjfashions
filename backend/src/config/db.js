import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  const options = {};
  if (process.env.MONGODB_TLS_INSECURE === 'true') {
    options.tlsAllowInvalidCertificates = true;
    logger.warn('MongoDB TLS certificate verification disabled (dev only)');
  }

  await mongoose.connect(uri, options);
  logger.info('MongoDB connected');
};

export default connectDB;
