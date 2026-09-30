import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';
import { getCloudinaryClient } from '../config/cloudinary.js';

export { PARENT_ENTITIES, parentResource } from '../utils/entities.js';

export async function persistUpload(file) {
  if (env.uploadDriver === 'cloudinary' && file.buffer) {
    const result = await uploadToCloudinary(file.buffer);
    return { path: result.secure_url, storageKey: result.public_id };
  }

  const filename = path.basename(file.path || '');
  return { path: `/uploads/${filename}`, storageKey: filename };
}

function uploadToCloudinary(buffer) {
  const client = getCloudinaryClient();
  if (!client) throw new Error('Cloudinary is not configured');

  return new Promise((resolve, reject) => {
    client.uploader
      .upload_stream({ folder: 'portfolio' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
}

export async function deleteFromStorage(file) {
  if (!file) return;

  if (env.uploadDriver === 'cloudinary' && file.storageKey) {
    const client = getCloudinaryClient();
    if (client) {
      try {
        await client.uploader.destroy(file.storageKey);
      } catch (error) {
        console.warn(`Cloudinary delete failed for ${file.storageKey}:`, error.message);
      }
      return;
    }
  }

  if (file.storageKey) {
    try {
      await fs.unlink(path.join(env.localUploadDir, file.storageKey));
    } catch {
      // local file may already be gone; ignore
    }
  }
}