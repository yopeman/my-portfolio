import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/index.js';
import { RESOURCES, hasPermission } from '../utils/permissions.js';
import {
  hashPassword,
  comparePassword,
  signToken,
  sanitizeUser,
  defaultPermissionsForRole,
  isValidPassword,
} from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('name, email, and password are required');
  }
  if (!isValidPassword(password)) {
    throw ApiError.badRequest('password must be between 8 characters and 72 bytes');
  }

  let finalRole = 'user';
  if (role && role !== 'user') {
    const isElevating = role === 'owner' || role === 'admin' || role === 'member';
    if (!isElevating) finalRole = 'user';
    else if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'admin')) {
      throw ApiError.forbidden('Only owner/admin can create users with elevated roles');
    } else if (role === 'owner' && req.user.role !== 'owner') {
      throw ApiError.forbidden('Only the owner can create another owner');
    } else {
      finalRole = role;
    }
  }

  const permissions = defaultPermissionsForRole(finalRole);
  if (finalRole !== 'user' && !RESOURCES.every((resource) => permissions[resource].every((action) => hasPermission(req.user, resource, action)))) {
    throw ApiError.forbidden('You cannot grant permissions you do not have');
  }

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash: await hashPassword(password),
    role: finalRole,
    permissions,
    source: req.body.source || 'credentials',
  });

  return res.status(201).json({ token: signToken(user), user: sanitizeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('email and password are required');

  const user = await User.findOne({ email, deletedAt: null });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return res.json({ token: signToken(user), user: sanitizeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

const UPDATABLE_FIELDS = ['name', 'email', 'phone', 'bio', 'additionalContact'];

export const updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of UPDATABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (req.body.password !== undefined || req.body.newPassword !== undefined) {
    const newPassword = req.body.newPassword ?? req.body.password;
    const currentPassword = req.body.currentPassword;
    if (!currentPassword) throw ApiError.badRequest('currentPassword is required to change password');
    if (!(await comparePassword(currentPassword, req.user.passwordHash))) {
      throw ApiError.badRequest('currentPassword is incorrect');
    }
    if (!isValidPassword(newPassword)) throw ApiError.badRequest('new password must be between 8 characters and 72 bytes');
    updates.passwordHash = await hashPassword(newPassword);
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No updatable fields provided');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return res.json({ user: sanitizeUser(user) });
});
