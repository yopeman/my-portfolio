import { Plan } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick, slugify } from '../utils/helpers.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';

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

const USER_ROLES = ['owner', 'admin', 'member', 'user', 'guest'];

function canView(plan, user) {
  if (plan.visibility.includes('guest')) return true;
  if (!user) return false;
  if (user.role === 'owner') return true;
  return plan.visibility.includes(user.role);
}

export const listPlans = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  if (req.query.period) filter.period = req.query.period;
  if (req.query.year) filter.year = req.query.year;

  const all = await Plan.find(filter).sort({ year: -1, periodNumber: 1, createdAt: -1 });
  const visible = all.filter((p) => canView(p, req.user));
  const items = visible.slice(skip, skip + limit);

  return res.json({ items, meta: pageMeta(page, limit, visible.length) });
});

export const getPlanBySlug = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ slug: req.params.slug, deletedAt: null });
  if (!plan || !canView(plan, req.user)) throw ApiError.notFound('Plan not found');
  return res.json({ plan });
});

export const getPlanChecklists = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ slug: req.params.slug, deletedAt: null });
  if (!plan || !canView(plan, req.user)) throw ApiError.notFound('Plan not found');
  return res.json({ checklists: plan.checklists });
});

export const createPlan = asyncHandler(async (req, res) => {
  const data = pick(req.body, PLAN_FIELDS);
  if (!data.title) throw ApiError.badRequest('title is required');
  if (!data.slug) data.slug = slugify(data.title) || data.title.toLowerCase().replace(/\s+/g, '-');
  if (data.visibility && !Array.isArray(data.visibility)) {
    data.visibility = Array.isArray(req.body.visibility) ? req.body.visibility : [req.body.visibility];
  }

  const plan = await Plan.create(data);
  return res.status(201).json({ plan });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const data = pick(req.body, PLAN_FIELDS);
  if (Object.keys(data).length === 0) throw ApiError.badRequest('No updatable fields provided');
  if (data.slug) data.slug = slugify(data.slug) || data.slug;
  if (data.visibility && !Array.isArray(data.visibility)) {
    data.visibility = [data.visibility];
  }

  const existing = await Plan.findOne({ _id: req.params.id, deletedAt: null });
  if (!existing) throw ApiError.notFound('Plan not found');

  const plan = await Plan.findByIdAndUpdate(existing._id, data, { new: true, runValidators: true });
  return res.json({ plan });
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ _id: req.params.id, deletedAt: null });
  if (!plan) throw ApiError.notFound('Plan not found');
  await Plan.findByIdAndUpdate(plan._id, { deletedAt: new Date() });
  return res.json({ success: true });
});