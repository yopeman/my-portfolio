import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', optionalAuth, authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.patch('/me', authenticate, authController.updateMe);

export default router;