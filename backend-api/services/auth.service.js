import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ROLE_DEFAULTS } from '../utils/permissions.js';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8 && Buffer.byteLength(password, 'utf8') <= 72;
}

export async function comparePassword(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string') return false;
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function sanitizeUser(user) {
  const doc = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  if (doc.permissions instanceof Map) {
    doc.permissions = Object.fromEntries(doc.permissions);
  }
  if (Array.isArray(doc.files)) {
    doc.files = doc.files.map((file) => {
      const value = typeof file.toObject === 'function' ? file.toObject() : { ...file };
      delete value.storageKey;
      delete value.__v;
      return value;
    });
  }
  delete doc.passwordHash;
  delete doc.__v;
  return doc;
}

export function defaultPermissionsForRole(role) {
  const defaults = ROLE_DEFAULTS[role] ?? ROLE_DEFAULTS.user;
  return Object.fromEntries(Object.entries(defaults).map(([resource, actions]) => [resource, [...actions]]));
}
