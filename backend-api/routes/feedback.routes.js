import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, feedbackController.listFeedback);
router.get('/counts', optionalAuth, feedbackController.countFeedback);
router.get('/replies', optionalAuth, feedbackController.listReplies);
router.get('/:id', feedbackController.getFeedback);
router.post('/', optionalAuth, feedbackController.createFeedback);
router.patch('/:id', authenticate, feedbackController.updateFeedback);
router.delete('/:id', authenticate, feedbackController.deleteFeedback);

export default router;