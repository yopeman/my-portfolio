import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', projectController.listProjects);
router.get('/:slug', projectController.getProjectBySlug);
router.post('/', authenticate, authorize('projects', 'CREATE'), projectController.createProject);
router.patch('/:id', authenticate, authorize('projects', 'UPDATE'), projectController.updateProject);
router.delete('/:id', authenticate, authorize('projects', 'DELETE'), projectController.deleteProject);

export default router;