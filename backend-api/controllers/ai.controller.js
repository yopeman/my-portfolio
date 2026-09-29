import { asyncHandler } from '../utils/asyncHandler.js';
import { enhanceFormData } from '../services/ai.service.js';

// Returns improved form values only. Nothing here touches the database, so the
// caller decides whether to keep the result.
export const enhance = asyncHandler(async (req, res) => {
  const { entity, data, instruction } = req.body || {};
  const result = await enhanceFormData({ entity, data, instruction });
  return res.json({ data: result.data });
});
