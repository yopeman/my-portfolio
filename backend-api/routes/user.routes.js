import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, authorize('users', 'READ'), userController.listUsers);
router.post('/', authenticate, authorize('users', 'CREATE'), userController.createUser);
router.get('/:id', authenticate, authorize('users', 'READ'), userController.getUser);
router.patch('/:id', authenticate, authorize('users', 'UPDATE'), userController.updateUser);
router.delete('/:id', authenticate, authorize('users', 'DELETE'), userController.deleteUser);

export default router;