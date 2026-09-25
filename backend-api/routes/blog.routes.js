import { Router } from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { authenticate, optionalAuth, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, blogController.listBlogs);
router.get('/:slug', blogController.getBlogBySlug);
router.post('/', authenticate, authorize('blogs', 'CREATE'), blogController.createBlog);
router.patch('/:id', authenticate, authorize('blogs', 'UPDATE'), blogController.updateBlog);
router.delete('/:id', authenticate, authorize('blogs', 'DELETE'), blogController.deleteBlog);

export default router;