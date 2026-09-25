import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick } from '../utils/helpers.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';
import { About, Blog, File, Plan, Project, User } from '../models/index.js';
import { persistUpload, deleteFromStorage, PARENT_ENTITIES, parentResource } from '../services/file.service.js';
import { authorize } from '../middlewares/auth.middleware.js';

const FILE_FIELDS = ['order', 'title', 'alt'];
const PARENT_MODELS = { user: User, about: About, project: Project, blog: Blog, plan: Plan };

async function ensureParentExists(parentEntity, parentId) {
  const Parent = PARENT_MODELS[parentEntity];
  if (!Parent || !mongoose.isValidObjectId(parentId)) throw ApiError.badRequest('A valid parentId is required');
  if (!(await Parent.exists({ _id: parentId, deletedAt: null }))) throw ApiError.notFound('Parent record not found');
}

export function authorizeParent(action) {
  return (req, res, next) => {
    const entity = req.fileDoc?.parentEntity || req.body.parentEntity || req.query.parentEntity;
    if (!entity) return next(ApiError.badRequest('parentEntity is required'));
    if (!PARENT_ENTITIES.includes(entity)) return next(ApiError.badRequest('Invalid parentEntity'));

    const resource = parentResource(entity);
    return authorize(resource, action)(req, res, next);
  };
}

export function authorizeLibrary(req, res, next) {
  if (req.query.parentEntity) {
    if (!req.query.parentId) return next(ApiError.badRequest('parentId is required when filtering by parentEntity'));
    return authorizeParent('READ')(req, res, next);
  }
  if (req.user?.role === 'owner' || req.user?.role === 'admin') return next();
  return next(ApiError.forbidden('Only owner/admin can browse the complete file library'));
}

export const findFile = asyncHandler(async (req, res, next) => {
  const file = await File.findOne({ _id: req.params.id, deletedAt: null });
  if (!file) throw ApiError.notFound('File not found');
  await ensureParentExists(file.parentEntity, file.parentId);
  req.fileDoc = file;
  next();
});

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const { parentEntity, parentId } = req.body;
  if (!parentEntity || !parentId) throw ApiError.badRequest('parentEntity and parentId are required');
  if (!PARENT_ENTITIES.includes(parentEntity)) throw ApiError.badRequest('Invalid parentEntity');
  await ensureParentExists(parentEntity, parentId);

  const storage = await persistUpload(req.file);
  const file = await File.create({
    parentEntity,
    parentId,
    order: req.body.order ?? 0,
    title: req.body.title,
    alt: req.body.alt,
    name: req.file.originalname || '',
    path: storage.path,
    storageKey: storage.storageKey,
    size: req.file.size,
    mimeType: req.file.mimetype,
    uploadedBy: req.user?._id ?? null,
  });

  return res.status(201).json({ file });
});

export const listFiles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  if (req.query.parentEntity) filter.parentEntity = req.query.parentEntity;
  if (req.query.parentId) {
    if (!req.query.parentEntity) throw ApiError.badRequest('parentEntity is required when filtering by parentId');
    if (!mongoose.isValidObjectId(req.query.parentId)) throw ApiError.badRequest('Invalid parentId');
    await ensureParentExists(req.query.parentEntity, req.query.parentId);
    filter.parentId = req.query.parentId;
  }

  const [items, total] = await Promise.all([
    File.find(filter).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limit),
    File.countDocuments(filter),
  ]);

  return res.json({ items, meta: pageMeta(page, limit, total) });
});

export const updateFile = asyncHandler(async (req, res) => {
  const data = pick(req.body, FILE_FIELDS);
  if (Object.keys(data).length === 0) throw ApiError.badRequest('No updatable fields provided');

  const file = await File.findByIdAndUpdate(req.fileDoc._id, data, { new: true, runValidators: true });
  return res.json({ file });
});

export const deleteFile = asyncHandler(async (req, res) => {
  await deleteFromStorage(req.fileDoc);
  await File.findByIdAndUpdate(req.fileDoc._id, { deletedAt: new Date() });
  return res.json({ success: true });
});