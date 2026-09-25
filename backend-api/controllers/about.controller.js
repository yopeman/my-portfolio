import { About, File } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick } from '../utils/helpers.js';
import { hasPermission } from '../utils/permissions.js';

const ABOUT_FIELDS = ['bio', 'headline', 'contacts', 'skills'];

function normalizeLink(value) {
  const link = String(value || '').trim();
  if (!link) return '';
  try {
    const url = new URL(link);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function normalizeOrder(value, index) {
  if (value === '' || value === null || value === undefined) return index;
  const order = Number(value);
  return Number.isFinite(order) ? order : index;
}

function normalizeContacts(value) {
  if (!Array.isArray(value)) throw ApiError.badRequest('contacts must be an array');
  return value
    .filter((contact) => contact && (contact.name || contact.title || contact.link))
    .map((contact, index) => ({
      name: String(contact.name || '').trim(),
      title: String(contact.title || '').trim(),
      link: normalizeLink(contact.link),
      order: normalizeOrder(contact.order, index),
    }));
}

function normalizeSkills(value) {
  if (!Array.isArray(value)) throw ApiError.badRequest('skills must be an array');
  return value
    .filter((skill) => skill && (skill.category || skill.name))
    .map((skill, index) => {
      const progress = Number(skill.progress ?? 50);
      if (!Number.isFinite(progress) || progress < 1 || progress > 100) {
        throw ApiError.badRequest(`skills.${index}.progress must be between 1 and 100`);
      }
      return {
        category: String(skill.category || '').trim(),
        name: String(skill.name || '').trim(),
        progress,
        order: normalizeOrder(skill.order, index),
      };
    });
}

function isImageFile(file) {
  const safeMimeTypes = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp']);
  return safeMimeTypes.has(file.mimeType) || /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file.path || '');
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

async function attachFiles(about, includeDetails = false) {
  if (!about) return null;
  const files = await File.find({
    parentEntity: 'about',
    parentId: about._id,
    deletedAt: null,
  }).sort({ order: 1, createdAt: 1 });
  about._doc.files = includeDetails ? files : files.filter(isImageFile).map(publicFile);
  return about;
}

export const getAbout = asyncHandler(async (req, res) => {
  const about = await About.findOne({ deletedAt: null });
  if (!about) throw ApiError.notFound('About not found');
  const includeDetails = !!req.user && hasPermission(req.user, 'about', 'READ');
  return res.json({ about: await attachFiles(about, includeDetails) });
});

export const upsertAbout = asyncHandler(async (req, res) => {
  const data = pick(req.body, ABOUT_FIELDS);
  if (data.contacts !== undefined) data.contacts = normalizeContacts(data.contacts);
  if (data.skills !== undefined) data.skills = normalizeSkills(data.skills);
  if (Object.keys(data).length === 0) throw ApiError.badRequest('No updatable fields provided');

  let about;
  const query = { deletedAt: null };
  const options = { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true };
  try {
    about = await About.findOneAndUpdate(query, { $set: data }, options);
  } catch (error) {
    if (error.code !== 11000) throw error;
    about = await About.findOneAndUpdate(query, { $set: data }, options);
  }
  return res.json({ about: await attachFiles(about, true) });
});
