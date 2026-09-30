import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { aiResourceFor } from '../services/ai.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hasPermission } from '../utils/permissions.js';

const router = Router();

// The entity decides which permission is required, so enhancing content needs
// the same rights as editing that content.
function authorizeEntity(req, res, next) {
  const resource = aiResourceFor(req.body?.entity);
  if (!resource) return next(ApiError.badRequest('entity must be one of: about, project, blog'));
  return authorize(resource, 'UPDATE')(req, res, next);
}

router.post('/enhance', authenticate, authorizeEntity, aiController.enhance);

router.get('/capabilities', authenticate, asyncHandler(async (req, res) => {
  return res.json({
    entities: ['about', 'project', 'blog'].map((entity) => ({
      entity,
      canEnhance: hasPermission(req.user, aiResourceFor(entity), 'UPDATE'),
    })),
  });
}));

export default router;
