import mongoose from 'mongoose';
import { Plan, File, User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick, slugify } from '../utils/helpers.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';
import { hasPermission } from '../utils/permissions.js';

const PLAN_FIELDS = [
  'slug',
  'visibility',
  'period',
  'year',
  'periodNumber',
  'parentPlan',
  'title',
  'description',
  'goal',
  'target',
  'checklists',
  'startDate',
  'endDate',
  'assignedTo',
];

const PERIODS = ['year', 'half', 'quarter', 'month', 'week', 'day'];
const VISIBILITIES = ['owner', 'admin', 'member', 'user', 'guest'];
const CHECKLIST_STATUSES = ['pending', 'in progress', 'completed', 'cancelled', 'failed'];
const SAFE_IMAGE_MIME_TYPES = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp']);

function normalizeVisibility(value) {
  const values = Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value];
  const unique = [...new Set(values.map(String))];
  if (unique.some((visibility) => !VISIBILITIES.includes(visibility))) throw ApiError.badRequest('visibility contains an invalid role');
  return unique.length > 0 ? unique : ['guest'];
}

function normalizeOrder(value, index) {
  if (value === '' || value === null || value === undefined) return index;
  const order = Number(value);
  return Number.isFinite(order) ? order : index;
}

function normalizeDate(value, field) {
  if (value === '' || value === null || value === undefined) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw ApiError.badRequest(`${field} must be a valid date`);
  return date;
}

function normalizeNumber(value, field, integer = false, minimum = null) {
  if (value === '' || value === null || value === undefined) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || (integer && !Number.isInteger(number)) || (minimum !== null && number < minimum)) {
    throw ApiError.badRequest(`${field} must be a valid number`);
  }
  return number;
}

function normalizeChecklists(value, existingChecklists = []) {
  if (!Array.isArray(value)) throw ApiError.badRequest('checklists must be an array');
  const existingById = new Map((existingChecklists || []).map((checklist) => [String(checklist._id), checklist]));
  const now = new Date();
  const normalized = value
    .filter((checklist) => checklist && (checklist.title || checklist.description))
    .map((checklist, index) => {
      const status = checklist.status || 'pending';
      if (!CHECKLIST_STATUSES.includes(status)) throw ApiError.badRequest(`checklists.${index}.status is invalid`);
      const existing = checklist._id ? existingById.get(String(checklist._id)) : null;
      const title = String(checklist.title || '').trim();
      const description = String(checklist.description || '').trim();
      const order = normalizeOrder(checklist.order, index);
      const changed = !existing || existing.title !== title || existing.description !== description || existing.status !== status || Number(existing.order ?? 0) !== order || existing.deletedAt;
      const item = {
        ...(existing ? { createdAt: existing.createdAt, updatedAt: changed ? now : existing.updatedAt } : {}),
        title,
        description,
        status,
        order,
        deletedAt: null,
      };
      if (checklist._id && mongoose.isValidObjectId(checklist._id)) item._id = checklist._id;
      return item;
    });
  const submittedIds = new Set(normalized.map((checklist) => String(checklist._id)).filter(Boolean));
  const deletedAt = new Date();
  for (const checklist of existingChecklists || []) {
    if (checklist.deletedAt || submittedIds.has(String(checklist._id))) continue;
    normalized.push({
      _id: checklist._id,
      createdAt: checklist.createdAt,
      updatedAt: now,
      title: checklist.title || '',
      description: checklist.description || '',
      status: checklist.status || 'pending',
      order: checklist.order ?? normalized.length,
      deletedAt,
    });
  }
  return normalized;
}

async function normalizeAssignedTo(value) {
  if (value === '' || value === null || value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  const ids = [...new Set(values.map(String))];
  if (ids.some((id) => !mongoose.isValidObjectId(id))) throw ApiError.badRequest('assignedTo must contain valid user IDs');
  const count = await User.countDocuments({ _id: { $in: ids }, deletedAt: null });
  if (count !== ids.length) throw ApiError.badRequest('assignedTo contains an unavailable user');
  return ids;
}

function normalizeParentPlan(value) {
  if (value === '' || value === null || value === undefined) return null;
  if (!mongoose.isValidObjectId(value)) throw ApiError.badRequest('parentPlan must be a valid plan ID');
  return value;
}

async function validateParentPlan({ planId, parentPlan, period }) {
  const parentId = normalizeParentPlan(parentPlan);
  if (period === 'year' && parentId) throw ApiError.badRequest('Year plans cannot have a parent plan');
  if (!parentId) return null;

  const visited = new Set();
  let currentId = parentId;
  while (currentId) {
    const key = String(currentId);
    if (visited.has(key)) throw ApiError.badRequest('Plan hierarchy cannot contain a cycle');
    if (planId && key === String(planId)) throw ApiError.badRequest('A plan cannot be its own parent');
    visited.add(key);
    const parent = await Plan.findOne({ _id: currentId, deletedAt: null }).select('_id parentPlan');
    if (!parent) throw ApiError.badRequest('parentPlan does not reference an active plan');
    currentId = parent.parentPlan || null;
  }
  return parentId;
}

async function normalizePlanData(data, existing = null) {
  if (data.visibility !== undefined) data.visibility = normalizeVisibility(data.visibility);
  if (data.period !== undefined && !PERIODS.includes(data.period)) throw ApiError.badRequest('Invalid plan period');
  if (data.year !== undefined) data.year = normalizeNumber(data.year, 'year', true, 1);
  if (data.periodNumber !== undefined) data.periodNumber = normalizeNumber(data.periodNumber, 'periodNumber', true, 1);
  if (data.startDate !== undefined) data.startDate = normalizeDate(data.startDate, 'startDate');
  if (data.endDate !== undefined) data.endDate = normalizeDate(data.endDate, 'endDate');
  const startDate = data.startDate !== undefined ? data.startDate : existing?.startDate;
  const endDate = data.endDate !== undefined ? data.endDate : existing?.endDate;
  if (startDate && endDate && endDate < startDate) throw ApiError.badRequest('endDate cannot be before startDate');
  if (data.checklists !== undefined) data.checklists = normalizeChecklists(data.checklists, existing?.checklists || []);
  if (data.assignedTo !== undefined) data.assignedTo = await normalizeAssignedTo(data.assignedTo);

  const period = data.period ?? existing?.period ?? 'year';
  const parentPlan = data.parentPlan !== undefined ? data.parentPlan : existing?.parentPlan;
  data.parentPlan = await validateParentPlan({ planId: existing?._id, parentPlan, period });
  return data;
}

function isImageFile(file) {
  return SAFE_IMAGE_MIME_TYPES.has(file.mimeType) || /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file.path || '');
}

function publicFile(file) {
  const value = typeof file.toObject === 'function' ? file.toObject() : file;
  return {
    _id: value._id,
    order: value.order ?? 0,
    title: value.title,
    alt: value.alt,
    name: value.name,
    path: value.path,
    size: value.size,
    mimeType: value.mimeType,
  };
}

async function attachFiles(plans, includeDetails = false) {
  if (!plans.length) return;
  const ids = plans.map((plan) => plan._id);
  const files = await File.find({
    parentEntity: 'plan',
    parentId: { $in: ids },
    deletedAt: null,
  }).sort({ order: 1, createdAt: 1 });
  const byParent = new Map();
  for (const file of files) {
    const key = file.parentId.toString();
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(file);
  }
  for (const plan of plans) {
    const planFiles = byParent.get(plan._id.toString()) || [];
    plan._doc.files = includeDetails ? planFiles : planFiles.filter(isImageFile).map(publicFile);
    plan._doc.checklists = (plan.checklists || []).filter((checklist) => !checklist.deletedAt);
  }
}

function canView(plan, user) {
  const visibility = Array.isArray(plan.visibility) ? plan.visibility : [];
  if (visibility.includes('guest')) return true;
  if (!user) return false;
  if (user.role === 'owner') return true;
  return visibility.includes(user.role);
}

async function descendantPlanIds(rootId) {
  const ids = [];
  let parents = [rootId];
  while (parents.length > 0) {
    const children = await Plan.find({ parentPlan: { $in: parents }, deletedAt: null }).select('_id');
    const next = children.map((child) => child._id).filter((id) => !ids.some((existing) => existing.equals(id)));
    if (next.length === 0) break;
    ids.push(...next);
    parents = next;
  }
  return ids;
}

export const listPlans = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  if (req.query.period) filter.period = req.query.period;
  if (req.query.year) filter.year = req.query.year;

  const all = await Plan.find(filter).sort({ year: -1, periodNumber: 1, createdAt: -1 });
  const visible = all.filter((plan) => canView(plan, req.user));
  const items = visible.slice(skip, skip + limit);
  const includeDetails = !!req.user && hasPermission(req.user, 'plans', 'READ');
  await attachFiles(items, includeDetails);

  return res.json({ items, meta: pageMeta(page, limit, visible.length) });
});

export const getPlanOptions = asyncHandler(async (req, res) => {
  const all = await Plan.find({ deletedAt: null })
    .select('title slug period year periodNumber parentPlan')
    .sort({ year: -1, periodNumber: 1, title: 1 });
  const items = all.filter((plan) => canView(plan, req.user));
  return res.json({ items });
});

export const getPlanAssignees = asyncHandler(async (req, res) => {
  const items = await User.find({ deletedAt: null }).select('name email role').sort({ name: 1 });
  return res.json({ items });
});

export const getPlanBySlug = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ slug: req.params.slug, deletedAt: null });
  if (!plan || !canView(plan, req.user)) throw ApiError.notFound('Plan not found');
  const includeDetails = !!req.user && hasPermission(req.user, 'plans', 'READ');
  await attachFiles([plan], includeDetails);
  return res.json({ plan });
});

export const getPlanChecklists = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ slug: req.params.slug, deletedAt: null });
  if (!plan || !canView(plan, req.user)) throw ApiError.notFound('Plan not found');
  return res.json({ checklists: plan.checklists.filter((checklist) => !checklist.deletedAt) });
});

export const createPlan = asyncHandler(async (req, res) => {
  const data = pick(req.body, PLAN_FIELDS);
  if (!data.title) throw ApiError.badRequest('title is required');
  data.slug = slugify(data.slug || data.title) || String(data.title).toLowerCase().replace(/\s+/g, '-');
  await normalizePlanData(data);
  const plan = await Plan.create(data);
  await attachFiles([plan], true);
  return res.status(201).json({ plan });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const data = pick(req.body, PLAN_FIELDS);
  if (Object.keys(data).length === 0) throw ApiError.badRequest('No updatable fields provided');
  const existing = await Plan.findOne({ _id: req.params.id, deletedAt: null });
  if (!existing) throw ApiError.notFound('Plan not found');

  if (data.slug !== undefined) {
    const sourceSlug = String(data.slug || '').trim();
    if (sourceSlug) data.slug = slugify(sourceSlug) || existing.slug || slugify(data.title || existing.title) || String(data.title || existing.title).toLowerCase().replace(/\s+/g, '-');
    else if (!existing.slug || (data.title !== undefined && data.title !== existing.title)) {
      data.slug = slugify(data.title || existing.title) || String(data.title || existing.title).toLowerCase().replace(/\s+/g, '-');
    } else {
      delete data.slug;
    }
  }

  await normalizePlanData(data, existing);
  if (Object.keys(data).length === 0) throw ApiError.badRequest('No updatable fields provided');
  const plan = await Plan.findByIdAndUpdate(existing._id, data, { new: true, runValidators: true });
  await attachFiles([plan], true);
  return res.json({ plan });
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ _id: req.params.id, deletedAt: null });
  if (!plan) throw ApiError.notFound('Plan not found');
  const ids = [plan._id, ...(await descendantPlanIds(plan._id))];
  const deletedAt = new Date();
  await Promise.all([
    Plan.updateMany({ _id: { $in: ids }, deletedAt: null }, { $set: { deletedAt } }),
    File.updateMany({ parentEntity: 'plan', parentId: { $in: ids }, deletedAt: null }, { $set: { deletedAt } }),
  ]);
  return res.json({ success: true });
});
