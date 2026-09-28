import { Router } from 'express';
import * as reactionController from '../controllers/reaction.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, reactionController.reactionSummary);
router.get('/counts', optionalAuth, reactionController.reactionCounts);
router.post('/', authenticate, reactionController.toggleReaction);

export default router;