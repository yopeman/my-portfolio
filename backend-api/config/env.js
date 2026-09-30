import path from 'path';
import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio',
  uploadDriver: process.env.UPLOAD_DRIVER || 'local',
  localUploadDir: path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR || 'uploads'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  receiverEmail: process.env.RECEIVER_EMAIL || 'yopeman318@gmail.com',
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  seed: {
    ownerEmail: process.env.SEED_OWNER_EMAIL || 'yopeman318@gmail.com',
    ownerPassword: process.env.SEED_OWNER_PASSWORD || 'seed-owner-pass-change-me',
    ownerName: process.env.SEED_OWNER_NAME || 'Yope Man',
  },
};

if (env.uploadDriver === 'cloudinary') {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[env] UPLOAD_DRIVER=cloudinary but CLOUDINARY_* variables are not set.');
  }
}

export { env };