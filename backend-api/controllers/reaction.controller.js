import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Reaction } from '../models/index.js';
import { REACTION_ENTITIES, isSystemEntity, SYSTEM_PARENT_ID } from '../utils/entities.js';

const TYPES = ['like', 'dislike', 'love'];

function emptySummary() {
  return { like: 0, dislike: 0, love: 0 };
}

function toObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value;
}

function assertParent(query) {
  const { parentEntity, parentId } = query;
  if (!parentEntity || !parentId) throw ApiError.badRequest('parentEntity and parentId are required');
  if (!REACTION_ENTITIES.includes(parentEntity)) throw ApiError.badRequest('Invalid parentEntity');
  if (!mongoose.Types.ObjectId.isValid(parentId)) throw ApiError.badRequest('Invalid parentId');
  if (isSystemEntity(parentEntity)) return { parentEntity, parentId: SYSTEM_PARENT_ID };
  return { parentEntity, parentId };
}

// Batched variant used by the admin views so a feedback thread can show reaction
// counts per item without firing one request per row.
export const reactionCounts = asyncHandler(async (req, res) => {
  const { parentEntity } = req.query;
  if (!parentEntity || !REACTION_ENTITIES.includes(parentEntity)) throw ApiError.badRequest('Invalid parentEntity');

  const ids = String(req.query.parentIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 200);
  if (ids.length === 0) return res.json({ summaries: {} });

  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
  const match = { parentEntity, deletedAt: null };
  if (objectIds.length > 0) match.parentId = { $in: objectIds };

  const rows = await Reaction.aggregate([
    { $match: match },
    { $group: { _id: { parentId: '$parentId', type: '$type' }, count: { $sum: 1 } } },
  ]);

  const byId = new Map();
  for (const id of ids) byId.set(id, { ...emptySummary(), total: 0 });
  for (const row of rows) {
    const key = String(row._id.parentId);
    const entry = byId.get(key);
    if (!entry) continue;
    entry[row._id.type] = row.count;
    entry.total += row.count;
  }

  return res.json({ summaries: Object.fromEntries(byId) });
});

export const reactionSummary = asyncHandler(async (req, res) => {
  const { parentEntity, parentId } = assertParent(req.query);
  const parentObjectId = toObjectId(parentId);

  const counts = await Reaction.aggregate([
    { $match: { parentEntity, parentId: parentObjectId, deletedAt: null } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const summary = emptySummary();
  for (const row of counts) summary[row._id] = row.count;

  let mine = null;
  if (req.user) {
    const my = await Reaction.findOne({ parentEntity, parentId, user: req.user._id, deletedAt: null });
    mine = my ? my.type : null;
  }

  return res.json({ summary, mine, total: counts.reduce((sum, row) => sum + row.count, 0) });
});

export const toggleReaction = asyncHandler(async (req, res) => {
  const { parentEntity, parentId } = assertParent(req.body);
  const type = req.body.type;
  if (!TYPES.includes(type)) throw ApiError.badRequest(`type must be one of: ${TYPES.join(', ')}`);

  const existing = await Reaction.findOne({ parentEntity, parentId, user: req.user._id });
  if (existing) {
    if (existing.type === type) {
      await existing.deleteOne();
      return res.json({ removed: true });
    }
    existing.type = type;
    await existing.save();
    return res.json({ reaction: existing });
  }

  const reaction = await Reaction.create({ parentEntity, parentId, user: req.user._id, type });
  return res.status(201).json({ reaction });
});