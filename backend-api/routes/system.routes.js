import { Router } from 'express';
import { SYSTEM_PARENT_ID } from '../utils/entities.js';

const router = Router();

// The site itself is not a database row, so clients need the well-known parent
// id to attach comments and reactions to it.
router.get('/', (_req, res) => {
  res.json({ system: { _id: SYSTEM_PARENT_ID, parentEntity: 'system' } });
});

export default router;
