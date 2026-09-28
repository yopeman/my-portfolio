import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';
import { Feedback } from '../models/index.js';
import { FEEDBACK_ENTITIES, parentResource } from '../utils/entities.js';
import { hasPermission } from '../utils/permissions.js';

const USER_POPULATE = { path: 'user', select: 'name email role' };
const MAX_BATCH = 200;

function assertParent(query, body) {
  const { parentEntity, parentId } = query;
  if (!parentEntity || !parentId) throw ApiError.badRequest('parentEntity and parentId are required');
  if (!FEEDBACK_ENTITIES.includes(parentEntity)) throw ApiError.badRequest('Invalid parentEntity');
  return { parentEntity, parentId };
}

function parseIds(value) {
  return String(value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_BATCH);
}

function toObjectIds(ids) {
  return ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
}

// A reply stores parentEntity 'feedback' with parentId pointing at the comment.
// Walk up to the owning resource so moderation follows the real permission.
async function resolveRootResource(doc) {
  let current = doc;
  const visited = new Set();
  for (let depth = 0; depth < 5; depth += 1) {
    if (current.parentEntity !== 'feedback') return parentResource(current.parentEntity);
    const key = String(current.parentId);
    if (visited.has(key)) return null;
    visited.add(key);
    current = await Feedback.findOne({ _id: current.parentId, deletedAt: null }).select('parentEntity parentId');
    if (!current) return null;
  }
  return null;
}

async function assertOwnerOrStaff(req, doc, action) {
  if (doc.user && req.user && doc.user.equals(req.user._id)) return;
  const resource = await resolveRootResource(doc);
  if (req.user && resource && hasPermission(req.user, resource, action)) return;
  throw ApiError.forbidden(`Missing permission: ${action} on ${doc.parentEntity}`);
}

export const listFeedback = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { parentEntity, parentId } = assertParent(req.query, null);

  const filter = { deletedAt: null, parentEntity, parentId };
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).populate(USER_POPULATE),
    Feedback.countDocuments(filter),
  ]);

  return res.json({ items, meta: pageMeta(page, limit, total) });
});

// Batched comment/reply counts so admin tables can show engagement per row
// without a request per record.
export const countFeedback = asyncHandler(async (req, res) => {
  const { parentEntity } = req.query;
  if (!parentEntity || !FEEDBACK_ENTITIES.includes(parentEntity)) throw ApiError.badRequest('Invalid parentEntity');

  const ids = parseIds(req.query.parentIds);
  const counts = Object.fromEntries(ids.map((id) => [id, { comments: 0, replies: 0, total: 0 }]));
  const objectIds = toObjectIds(ids);
  if (objectIds.length === 0) return res.json({ counts });

  const rows = await Feedback.aggregate([
    { $match: { parentEntity, parentId: { $in: objectIds }, deletedAt: null } },
    { $group: { _id: { parentId: '$parentId', type: '$type' }, count: { $sum: 1 } } },
  ]);

  for (const row of rows) {
    const entry = counts[String(row._id.parentId)];
    if (!entry) continue;
    if (row._id.type === 'reply') entry.replies += row.count;
    else entry.comments += row.count;
    entry.total += row.count;
  }

  return res.json({ counts });
});

// Batched reply lookup so a whole comment thread renders in one request.
export const listReplies = asyncHandler(async (req, res) => {
  const ids = parseIds(req.query.parentIds);
  const replies = Object.fromEntries(ids.map((id) => [id, []]));
  const objectIds = toObjectIds(ids);
  if (objectIds.length === 0) return res.json({ replies });

  const items = await Feedback.find({ parentEntity: 'feedback', parentId: { $in: objectIds }, deletedAt: null })
    .sort({ createdAt: 1 })
    .populate(USER_POPULATE);

  for (const reply of items) {
    const key = String(reply.parentId);
    if (replies[key]) replies[key].push(reply);
  }

  return res.json({ replies });
});

export const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({ _id: req.params.id, deletedAt: null }).populate(USER_POPULATE);
  if (!feedback) throw ApiError.notFound('Feedback not found');
  return res.json({ feedback });
});

export const createFeedback = asyncHandler(async (req, res) => {
  const params = assertParent(req.body, null);
  if (!req.body.content) throw ApiError.badRequest('content is required');

  // A reply must point at a live comment, otherwise it can never be listed back.
  if (params.parentEntity === 'feedback') {
    if (!mongoose.Types.ObjectId.isValid(params.parentId)) throw ApiError.badRequest('Invalid parentId');
    const comment = await Feedback.findOne({ _id: params.parentId, deletedAt: null }).select('_id');
    if (!comment) throw ApiError.notFound('Comment not found');
  }

  const feedback = await Feedback.create({
    ...params,
    type: req.body.type || 'feedback',
    user: req.user?._id ?? null,
    content: req.body.content,
  });

  await feedback.populate(USER_POPULATE);
  return res.status(201).json({ feedback });
});

export const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({ _id: req.params.id, deletedAt: null });
  if (!feedback) throw ApiError.notFound('Feedback not found');

  assertOwnerOrStaff(req, feedback, 'UPDATE');

  if (req.body.content !== undefined) feedback.content = req.body.content;
  if (req.body.type !== undefined) feedback.type = req.body.type;
  await feedback.save();
  await feedback.populate(USER_POPULATE);
  return res.json({ feedback });
});

export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({ _id: req.params.id, deletedAt: null });
  if (!feedback) throw ApiError.notFound('Feedback not found');

  assertOwnerOrStaff(req, feedback, 'DELETE');

  await Feedback.findByIdAndUpdate(feedback._id, { deletedAt: new Date() });
  return res.json({ success: true });
});