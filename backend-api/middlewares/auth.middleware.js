import { ApiError } from '../utils/ApiError.js';
import { hasPermission } from '../utils/permissions.js';
import { User } from '../models/index.js';
import { verifyToken } from '../services/auth.service.js';

function extractBearer(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function authenticate(req, res, next) {
  try {
    const token = extractBearer(req);
    if (!token) throw ApiError.unauthorized('Missing bearer token');

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user || user.deletedAt) throw ApiError.unauthorized('Invalid or expired token');

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    return next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const token = extractBearer(req);
    if (!token) return next();

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (user && !user.deletedAt) req.user = user;
    return next();
  } catch {
    return next();
  }
}

export function authorize(resource, action) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (hasPermission(req.user, resource, action)) return next();
    return next(ApiError.forbidden(`Missing permission: ${action} on ${resource}`));
  };
}
