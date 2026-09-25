import { File, Project } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick, slugify } from '../utils/helpers.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';

async function attachFiles(projects) {
  if (!projects.length) return;
  const ids = projects.map((p) => p._id);
  const files = await File.find({
    parentEntity: 'project',
    parentId: { $in: ids },
    deletedAt: null,
  }).sort({ order: 1, createdAt: 1 });
  const byParent = new Map();
  for (const file of files) {
    const key = file.parentId.toString();
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(file);
  }
  for (const project of projects) {
    project._doc.files = byParent.get(project._id.toString()) || [];
  }
}

const PROJECT_FIELDS = [
  'name',
  'slug',
  'description',
  'problem',
  'solution',
  'summary',
  'order',
  'tags',
  'type',
  'features',
  'stacks',
  'links',
];

export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.tag) filter.tags = req.query.tag;

  const [items, total] = await Promise.all([
    Project.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(filter),
  ]);

  await attachFiles(items);

  return res.json({ items, meta: pageMeta(page, limit, total) });
});

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, deletedAt: null });
  if (!project) throw ApiError.notFound('Project not found');
  await attachFiles([project]);
  return res.json({ project });
});

export const createProject = asyncHandler(async (req, res) => {
  const data = pick(req.body, PROJECT_FIELDS);
  if (!data.name) throw ApiError.badRequest('name is required');
  if (!data.slug) data.slug = slugify(data.name) || data.name.toLowerCase().replace(/\s+/g, '-');

  const project = await Project.create(data);
  return res.status(201).json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const data = pick(req.body, PROJECT_FIELDS);
  if (Object.keys(data).length === 0) throw ApiError.badRequest('No updatable fields provided');
  if (data.slug) data.slug = slugify(data.slug) || data.slug;

  const existing = await Project.findOne({ _id: req.params.id, deletedAt: null });
  if (!existing) throw ApiError.notFound('Project not found');

  const project = await Project.findByIdAndUpdate(existing._id, data, { new: true, runValidators: true });
  return res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null });
  if (!project) throw ApiError.notFound('Project not found');
  await Project.findByIdAndUpdate(project._id, { deletedAt: new Date() });
  return res.json({ success: true });
});