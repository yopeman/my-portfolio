import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';
import { pick } from '../utils/helpers.js';
import { ACTIONS, RESOURCES, hasPermission } from '../utils/permissions.js';
import { File, User } from '../models/index.js';
import { defaultPermissionsForRole, hashPassword, isValidPassword, sanitizeUser } from '../services/auth.service.js';

const USER_FIELDS = ['name', 'email', 'phone', 'bio', 'additionalContact', 'source'];
const ROLES = ['owner', 'admin', 'member', 'user'];

async function attachFiles(users) {
  if (!users.length) return;
  const ids = users.map((user) => user._id);
  const files = await File.find({
    parentEntity: 'user',
    parentId: { $in: ids },
    deletedAt: null,
  }).sort({ order: 1, createdAt: 1 });
  const byParent = new Map();
  for (const file of files) {
    const key = file.parentId.toString();
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(file);
  }
  for (const user of users) {
    user._doc.files = byParent.get(user._id.toString()) || [];
  }
}

function normalizePermissions(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw ApiError.badRequest('permissions must be an object');
  }
  const permissions = {};
  for (const resource of RESOURCES) {
    const actions = value[resource] ?? [];
    if (!Array.isArray(actions)) throw ApiError.badRequest(`permissions.${resource} must be an array`);
    const uniqueActions = [...new Set(actions.map(String))];
    if (uniqueActions.some((action) => !ACTIONS.includes(action))) {
      throw ApiError.badRequest(`Invalid permission action for ${resource}`);
    }
    permissions[resource] = uniqueActions;
  }
  return permissions;
}

function canGrantPermissions(actor, permissions) {
  if (actor?.role === 'owner') return true;
  return RESOURCES.every((resource) => permissions[resource].every((action) => hasPermission(actor, resource, action)));
}

function resolveRole(role, actor) {
  const finalRole = role || 'user';
  if (!ROLES.includes(finalRole)) throw ApiError.badRequest('Invalid role');
  if (finalRole === 'user') return finalRole;
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    throw ApiError.forbidden('Only owner/admin can create users with elevated roles');
  }
  if (finalRole === 'owner' && actor.role !== 'owner') {
    throw ApiError.forbidden('Only the owner can create another owner');
  }
  return finalRole;
}

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) throw ApiError.badRequest('name, email, and password are required');
  if (!isValidPassword(password)) throw ApiError.badRequest('password must be between 8 characters and 72 bytes');

  const role = resolveRole(req.body.role, req.user);
  const permissions = req.body.permissions === undefined
    ? defaultPermissionsForRole(role)
    : normalizePermissions(req.body.permissions);
  if (!canGrantPermissions(req.user, permissions)) {
    throw ApiError.forbidden('You cannot grant permissions you do not have');
  }
  const user = await User.create({
    name,
    email,
    phone,
    additionalContact: req.body.additionalContact,
    bio: req.body.bio,
    passwordHash: await hashPassword(password),
    role,
    permissions,
    source: req.body.source || 'credentials',
  });
  await attachFiles([user]);
  return res.status(201).json({ user: sanitizeUser(user) });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-passwordHash'),
    User.countDocuments(filter),
  ]);

  await attachFiles(items);
  return res.json({ items: items.map(sanitizeUser), meta: pageMeta(page, limit, total) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select('-passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  await attachFiles([user]);
  return res.json({ user: sanitizeUser(user) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'owner' && req.user.role !== 'owner') {
    throw ApiError.forbidden('Only the owner can modify an owner account');
  }

  const updates = pick(req.body, USER_FIELDS);
  let roleChanged = false;

  if (req.body.role !== undefined) {
    if (!ROLES.includes(req.body.role)) throw ApiError.badRequest('Invalid role');
    if (req.body.role !== user.role) {
      if (user._id.toString() === req.user._id.toString()) {
        throw ApiError.badRequest('You cannot change your own role');
      }
      updates.role = resolveRole(req.body.role, req.user);
      if (user.role === 'owner' && updates.role !== 'owner') {
        const ownerCount = await User.countDocuments({ role: 'owner', deletedAt: null });
        if (ownerCount <= 1) throw ApiError.badRequest('The last owner account cannot be demoted');
      }
      roleChanged = true;
    }
  }

  if (req.body.permissions !== undefined) {
    const permissions = normalizePermissions(req.body.permissions);
    if (!canGrantPermissions(req.user, permissions)) {
      throw ApiError.forbidden('You cannot grant permissions you do not have');
    }
    updates.permissions = permissions;
  } else if (roleChanged) {
    updates.permissions = defaultPermissionsForRole(updates.role);
  }

  if (req.body.password) {
    if (!isValidPassword(req.body.password)) {
      throw ApiError.badRequest('password must be between 8 characters and 72 bytes');
    }
    updates.passwordHash = await hashPassword(req.body.password);
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No updatable fields provided');
  }

  const updated = await User.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
  await attachFiles([updated]);
  return res.json({ user: sanitizeUser(updated) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'owner' && req.user.role !== 'owner') {
    throw ApiError.forbidden('Only the owner can delete an owner account');
  }
  if (user.role === 'owner') {
    const ownerCount = await User.countDocuments({ role: 'owner', deletedAt: null });
    if (ownerCount <= 1) throw ApiError.badRequest('The last owner account cannot be deleted');
  }

  const deletedAt = new Date();
  await Promise.all([
    User.findByIdAndUpdate(user._id, { deletedAt }),
    File.updateMany({ parentEntity: 'user', parentId: user._id, deletedAt: null }, { $set: { deletedAt } }),
  ]);
  return res.json({ success: true });
});