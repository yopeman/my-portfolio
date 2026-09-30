import { Router } from 'express';
import * as aboutController from '../controllers/about.controller.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, aboutController.getAbout);
router.put('/', authenticate, authorize('about', 'UPDATE'), aboutController.upsertAbout);

export default router;