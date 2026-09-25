import { Request } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick } from '../utils/helpers.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';

const REQUEST_FIELDS = ['message', 'project', 'requirements', 'minBudget', 'maxBudget', 'timeline'];

export const listMyRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null, user: req.user._id };

  const [items, total] = await Promise.all([
    Request.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Request.countDocuments(filter),
  ]);

  return res.json({ items, meta: pageMeta(page, limit, total) });
});

export const listAllRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.isRead === 'true') filter.isRead = true;
  if (req.query.isRead === 'false') filter.isRead = false;

  const [items, total] = await Promise.all([
    Request.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Request.countDocuments(filter),
  ]);

  return res.json({ items, meta: pageMeta(page, limit, total) });
});

export const createRequest = asyncHandler(async (req, res) => {
  const data = pick(req.body, REQUEST_FIELDS);
  if (!data.message) throw ApiError.badRequest('message is required');

  if (req.user) data.user = req.user._id;
  const request = await Request.create(data);
  return res.status(201).json({ request });
});

export const updateRequest = asyncHandler(async (req, res) => {
  const request = await Request.findOne({ _id: req.params.id, deletedAt: null });
  if (!request) throw ApiError.notFound('Request not found');

  const allowed = ['isRead', 'status', 'assignedTo', 'project', 'message', 'requirements', 'minBudget', 'maxBudget', 'timeline'];
  const updates = pick(req.body, allowed);

  if (updates.isRead === true || updates.isRead === false) {
    updates.isRead = updates.isRead;
    if (updates.isRead) updates.readAt = new Date();
  }
  if (updates.status && ['replied', 'assigned', 'completed'].includes(updates.status)) {
    updates.repliedAt = new Date();
  }

  if (Object.keys(updates).length === 0) throw ApiError.badRequest('No updatable fields provided');

  const updated = await Request.findByIdAndUpdate(request._id, updates, { new: true, runValidators: true });
  return res.json({ request: updated });
});

export const deleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findOne({ _id: req.params.id, deletedAt: null });
  if (!request) throw ApiError.notFound('Request not found');
  await Request.findByIdAndUpdate(request._id, { deletedAt: new Date() });
  return res.json({ success: true });
});