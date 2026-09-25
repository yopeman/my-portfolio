import { About } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick } from '../utils/helpers.js';

const ABOUT_FIELDS = ['bio', 'headline', 'contacts', 'skills'];

export const getAbout = asyncHandler(async (req, res) => {
  const about = await About.findOne({ deletedAt: null });
  if (!about) throw ApiError.notFound('About not found');
  return res.json({ about });
});

export const upsertAbout = asyncHandler(async (req, res) => {
  const data = pick(req.body, ABOUT_FIELDS);
  if (Object.keys(data).length === 0) throw ApiError.badRequest('No updatable fields provided');

  const existing = await About.findOne({ deletedAt: null });
  if (existing) {
    const about = await About.findByIdAndUpdate(existing._id, data, { new: true, runValidators: true });
    return res.json({ about });
  }

  const about = await About.create(data);
  return res.status(201).json({ about });
});