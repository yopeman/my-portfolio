import { Router } from 'express';
import * as planController from '../controllers/plan.controller.js';
import { authenticate, optionalAuth, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, planController.listPlans);
router.get('/:slug/checklists', optionalAuth, planController.getPlanChecklists);
router.get('/:slug', optionalAuth, planController.getPlanBySlug);
router.post('/', authenticate, authorize('plans', 'CREATE'), planController.createPlan);
router.patch('/:id', authenticate, authorize('plans', 'UPDATE'), planController.updatePlan);
router.delete('/:id', authenticate, authorize('plans', 'DELETE'), planController.deletePlan);

export default router;