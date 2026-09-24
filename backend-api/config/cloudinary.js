import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

export function configureCloudinary() {
  const { apiKey, apiSecret } = env.cloudinary;
  if (env.uploadDriver !== 'cloudinary' || !apiKey || !apiSecret) {
    return null;
  }
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  return cloudinary;
}