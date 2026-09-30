import fs from 'fs';
import multer from 'multer';
import { env } from './env.js';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function createUploadMiddleware({ fieldName = 'file', maxFileSize = 10 * 1024 * 1024 } = {}) {
  if (env.uploadDriver === 'cloudinary') {
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: maxFileSize },
    }).single(fieldName);
  }

  ensureDir(env.localUploadDir);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDir(env.localUploadDir);
      cb(null, env.localUploadDir);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}-${file.originalname}`);
    },
  });
  return multer({ storage, limits: { fileSize: maxFileSize } }).single(fieldName);
}

export function getStorageDriver() {
  return env.uploadDriver;
}