import { Subscriber } from '../models/index.js';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalized = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) throw ApiError.badRequest('A valid email is required');

  const existing = await Subscriber.findOne({ email: normalized });
  if (existing) {
    if (!existing.deletedAt && !existing.unsubscribedAt) {
      return res.json({ subscriber: existing });
    }
    existing.deletedAt = null;
    existing.unsubscribedAt = null;
    await existing.save();
    return res.json({ subscriber: existing });
  }

  const subscriber = await Subscriber.create({ email: normalized });
  return res.status(201).json({ subscriber });
});

export const listSubscribers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  const [items, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Subscriber.countDocuments(filter),
  ]);
  return res.json({ items, meta: pageMeta(page, limit, total) });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
  let subscriber = null;

  if (req.params.id && req.params.id !== ':id' && mongoose.isValidObjectId(req.params.id)) {
    subscriber = await Subscriber.findOne({ _id: req.params.id, deletedAt: null });
  }
  if (!subscriber && normalizedEmail) {
    subscriber = await Subscriber.findOne({ email: normalizedEmail, deletedAt: null });
  }
  if (!subscriber) throw ApiError.notFound('Subscriber not found');
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();
  return res.json({ subscriber });
});

export const removeSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findOne({ _id: req.params.id, deletedAt: null });
  if (!subscriber) throw ApiError.notFound('Subscriber not found');
  await Subscriber.findByIdAndUpdate(subscriber._id, { deletedAt: new Date() });
  return res.json({ success: true });
});