import { Router } from 'express';
import * as requestController from '../controllers/request.controller.js';
import { authenticate, optionalAuth, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, requestController.listMyRequests);
router.get('/all', authenticate, authorize('requests', 'READ'), requestController.listAllRequests);
router.post('/', optionalAuth, requestController.createRequest);
router.patch('/:id', authenticate, authorize('requests', 'UPDATE'), requestController.updateRequest);
router.delete('/:id', authenticate, authorize('requests', 'DELETE'), requestController.deleteRequest);

export default router;