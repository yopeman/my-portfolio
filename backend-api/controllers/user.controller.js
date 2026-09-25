import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';
import { pick } from '../utils/helpers.js';
import { User } from '../models/index.js';
import { hashPassword, sanitizeUser } from '../services/auth.service.js';

const USER_FIELDS = ['name', 'email', 'phone', 'bio', 'additionalContact'];

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-passwordHash'),
    User.countDocuments(filter),
  ]);

  return res.json({ items, meta: pageMeta(page, limit, total) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select('-passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  return res.json({ user: sanitizeUser(user) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw ApiError.notFound('User not found');

  if (req.body.role !== undefined && req.body.role !== user.role && user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  const updates = pick(req.body, USER_FIELDS);

  if (req.body.role !== undefined && req.body.role !== user.role) {
    const elevating = ['owner', 'admin', 'member'].includes(req.body.role);
    if (!elevating) {
      updates.role = 'user';
    } else if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      throw ApiError.forbidden('Only owner/admin can elevate roles');
    } else if (req.body.role === 'owner' && req.user.role !== 'owner') {
      throw ApiError.forbidden('Only the owner can create another owner');
    } else {
      updates.role = req.body.role;
    }
  }

  if (req.body.password) {
    if (String(req.body.password).length < 8) {
      throw ApiError.badRequest('password must be at least 8 characters');
    }
    updates.passwordHash = await hashPassword(req.body.password);
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No updatable fields provided');
  }

  const updated = await User.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
  return res.json({ user: sanitizeUser(updated) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw ApiError.notFound('User not found');

  await User.findByIdAndUpdate(user._id, { deletedAt: new Date() });
  return res.json({ success: true });
});