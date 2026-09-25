import { Router } from 'express';
import * as aboutController from '../controllers/about.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', aboutController.getAbout);
router.put('/', authenticate, authorize('about', 'UPDATE'), aboutController.upsertAbout);

export default router;