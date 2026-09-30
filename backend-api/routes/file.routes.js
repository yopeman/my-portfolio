import fs from 'fs/promises';
import { Router } from 'express';
import * as fileController from '../controllers/file.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createUploadMiddleware } from '../config/storage.js';

const router = Router();

router.get('/gallery', fileController.listGallery);

router.get('/', authenticate, fileController.authorizeLibrary, fileController.listFiles);

router.post(
  '/',
  authenticate,
  createUploadMiddleware({ fieldName: 'file', maxFileSize: 20 * 1024 * 1024 }),
  fileController.authorizeParent('UPDATE'),
  fileController.uploadFile,
  async (err, req, res, next) => {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {
        // already removed or unsaved; ignore
      }
    }
    next(err);
  }
);

router.patch(
  '/:id',
  authenticate,
  fileController.findFile,
  fileController.authorizeParent('UPDATE'),
  fileController.updateFile
);

router.delete(
  '/:id',
  authenticate,
  fileController.findFile,
  fileController.authorizeParent('DELETE'),
  fileController.deleteFile
);

export default router;