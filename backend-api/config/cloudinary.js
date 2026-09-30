import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

let client = null;

if (
  env.uploadDriver === 'cloudinary' &&
  env.cloudinary.cloudName &&
  env.cloudinary.apiKey &&
  env.cloudinary.apiSecret
) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
  client = cloudinary;
}

export function configureCloudinary() {
  return client;
}

export function getCloudinaryClient() {
  return client;
}