import { Router } from 'express';
import * as subscriberController from '../controllers/subscriber.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', subscriberController.subscribe);
router.post('/:id/unsubscribe', subscriberController.unsubscribe);
router.get('/', authenticate, authorize('subscribers', 'READ'), subscriberController.listSubscribers);
router.delete('/:id', authenticate, authorize('subscribers', 'DELETE'), subscriberController.removeSubscriber);

export default router;