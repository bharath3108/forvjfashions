import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
console.log('Testing URI host:', uri?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));

try {
  const options = {};
  if (process.env.MONGODB_TLS_INSECURE === 'true') {
    options.tlsAllowInvalidCertificates = true;
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000, ...options });
  console.log('SUCCESS: Connected to MongoDB');
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.log('FAILED:', err.name);
  console.log('Message:', err.message);
  const servers = [...(err.reason?.servers?.values() || [])];
  servers.forEach((srv, i) => {
    console.log(`Server ${i + 1}:`, srv.address);
    console.log('  Error:', srv.error?.message || srv.error);
    if (srv.error?.cause) console.log('  Cause:', srv.error.cause.message || srv.error.cause);
  });
  process.exit(1);
}
