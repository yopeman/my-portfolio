import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Reaction } from '../models/index.js';
import { REACTION_ENTITIES } from '../utils/entities.js';

const TYPES = ['like', 'dislike', 'love'];

function assertParent(query) {
  const { parentEntity, parentId } = query;
  if (!parentEntity || !parentId) throw ApiError.badRequest('parentEntity and parentId are required');
  if (!REACTION_ENTITIES.includes(parentEntity)) throw ApiError.badRequest('Invalid parentEntity');
  return { parentEntity, parentId };
}

export const reactionSummary = asyncHandler(async (req, res) => {
  const { parentEntity, parentId } = assertParent(req.query);
  const parentObjectId = mongoose.Types.ObjectId.isValid(parentId)
    ? new mongoose.Types.ObjectId(parentId)
    : parentId;

  const counts = await Reaction.aggregate([
    { $match: { parentEntity, parentId: parentObjectId, deletedAt: null } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const summary = { like: 0, dislike: 0, love: 0 };
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