import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';
import { Feedback } from '../models/index.js';
import { FEEDBACK_ENTITIES, parentResource } from '../utils/entities.js';
import { hasPermission } from '../utils/permissions.js';

const USER_POPULATE = { path: 'user', select: 'name email role' };

function assertParent(query, body) {
  const { parentEntity, parentId } = query;
  if (!parentEntity || !parentId) throw ApiError.badRequest('parentEntity and parentId are required');
  if (!FEEDBACK_ENTITIES.includes(parentEntity)) throw ApiError.badRequest('Invalid parentEntity');
  return { parentEntity, parentId };
}

function assertOwnerOrStaff(req, doc, action) {
  if (doc.user && req.user && doc.user.equals(req.user._id)) return;
  const resource = parentResource(doc.parentEntity);
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

export const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({ _id: req.params.id, deletedAt: null }).populate(USER_POPULATE);
  if (!feedback) throw ApiError.notFound('Feedback not found');
  return res.json({ feedback });
});

export const createFeedback = asyncHandler(async (req, res) => {
  const params = assertParent(req.body, null);
  if (!req.body.content) throw ApiError.badRequest('content is required');

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