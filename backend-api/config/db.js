import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
}

export async function disconnectDB() {
  if (isDbReady()) {
    await mongoose.disconnect();
  }
}

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}