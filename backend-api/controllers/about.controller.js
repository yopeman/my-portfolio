import mongoose from 'mongoose';
import { About, File } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick } from '../utils/helpers.js';
import { hasPermission } from '../utils/permissions.js';

const ABOUT_FIELDS = ['bio', 'headline', 'contacts', 'skills', 'educations', 'experiences'];
const EXPERIENCE_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

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

function normalizeDate(value, field) {
  if (value === '' || value === null || value === undefined) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw ApiError.badRequest(`${field} must be a valid date`);
  return date;
}

function normalizeNumber(value, field, minimum = null, maximum = null) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || (minimum !== null && number < minimum) || (maximum !== null && number > maximum)) {
    throw ApiError.badRequest(`${field} must be a valid number`);
  }
  return number;
}

function normalizeStringList(value, field) {
  if (value === undefined || value === null || value === '') return [];
  const values = Array.isArray(value) ? value : String(value).split(',');
  return values.map((entry) => String(entry ?? '').trim()).filter(Boolean);
}

// Mirrors the Plan.checklists merge: persisted sub-docs that the client stops
// submitting are tombstoned with deletedAt instead of being dropped.
function mergeSoftDeleted(existingItems, submitted, tombstone, keyOf) {
  const submittedIds = new Set(submitted.map(keyOf).filter(Boolean));
  for (const item of existingItems) {
    if (item.deletedAt || submittedIds.has(String(item._id))) continue;
    submitted.push({ ...tombstone(item) });
  }
  return submitted;
}

function normalizeEducations(value, existingEducations = []) {
  if (!Array.isArray(value)) throw ApiError.badRequest('educations must be an array');
  const existingById = new Map((existingEducations || []).map((education) => [String(education._id), education]));
  const now = new Date();

  const normalized = value
    .filter((education) => education && (education.institution || education.degree || education.field))
    .map((education, index) => {
      const startDate = normalizeDate(education.startDate, `educations.${index}.startDate`);
      const endDate = normalizeDate(education.endDate, `educations.${index}.endDate`);
      if (startDate && endDate && endDate < startDate) {
        throw ApiError.badRequest(`educations.${index}.endDate cannot be before startDate`);
      }
      const existing = education._id ? existingById.get(String(education._id)) : null;
      const fields = {
        institution: String(education.institution || '').trim(),
        degree: String(education.degree || '').trim(),
        field: String(education.field || '').trim(),
        location: String(education.location || '').trim(),
        startDate,
        endDate,
        cgpa: normalizeNumber(education.cgpa, `educations.${index}.cgpa`, 0, 10),
        description: String(education.description || '').trim(),
        link: normalizeLink(education.link),
        order: normalizeOrder(education.order, index),
      };
      const changed = !existing || existing.deletedAt || Object.keys(fields).some((key) => {
        const before = existing[key];
        const after = fields[key];
        return key === 'startDate' || key === 'endDate' || key === 'cgpa'
          ? (before ? new Date(before).getTime() : null) !== (after ? new Date(after).getTime() : null)
          : String(before ?? '') !== String(after ?? '');
      });
      const item = {
        ...(existing ? { createdAt: existing.createdAt, updatedAt: changed ? now : existing.updatedAt } : {}),
        ...fields,
        deletedAt: null,
      };
      if (education._id && mongoose.isValidObjectId(education._id)) item._id = education._id;
      return item;
    });

  return mergeSoftDeleted(existingEducations, normalized, (education) => ({
    _id: education._id,
    createdAt: education.createdAt,
    updatedAt: now,
    institution: education.institution || '',
    degree: education.degree || '',
    field: education.field || '',
    location: education.location || '',
    startDate: education.startDate ?? null,
    endDate: education.endDate ?? null,
    cgpa: education.cgpa ?? null,
    description: education.description || '',
    link: education.link || '',
    order: education.order ?? normalized.length,
    deletedAt: now,
  }), (education) => education._id);
}

function normalizeExperiences(value, existingExperiences = []) {
  if (!Array.isArray(value)) throw ApiError.badRequest('experiences must be an array');
  const existingById = new Map((existingExperiences || []).map((experience) => [String(experience._id), experience]));
  const now = new Date();

  const normalized = value
    .filter((experience) => experience && (experience.company || experience.role))
    .map((experience, index) => {
      const type = experience.type || 'full-time';
      if (!EXPERIENCE_TYPES.includes(type)) throw ApiError.badRequest(`experiences.${index}.type is invalid`);
      const startDate = normalizeDate(experience.startDate, `experiences.${index}.startDate`);
      // A null endDate marks the current role, so it is always allowed.
      const endDate = normalizeDate(experience.endDate, `experiences.${index}.endDate`);
      if (startDate && endDate && endDate < startDate) {
        throw ApiError.badRequest(`experiences.${index}.endDate cannot be before startDate`);
      }
      const existing = experience._id ? existingById.get(String(experience._id)) : null;
      const fields = {
        company: String(experience.company || '').trim(),
        role: String(experience.role || '').trim(),
        type,
        location: String(experience.location || '').trim(),
        remote: experience.remote === true || experience.remote === 'true',
        startDate,
        endDate,
        description: String(experience.description || '').trim(),
        highlights: normalizeStringList(experience.highlights, `experiences.${index}.highlights`),
        skills: normalizeStringList(experience.skills, `experiences.${index}.skills`),
        link: normalizeLink(experience.link),
        order: normalizeOrder(experience.order, index),
      };
      const changed = !existing || existing.deletedAt || Object.keys(fields).some((key) => {
        const before = existing[key];
        const after = fields[key];
        if (key === 'highlights' || key === 'skills') {
          return JSON.stringify(before || []) !== JSON.stringify(after);
        }
        if (key === 'startDate' || key === 'endDate') {
          return (before ? new Date(before).getTime() : null) !== (after ? new Date(after).getTime() : null);
        }
        if (key === 'remote') return Boolean(before) !== after;
        return String(before ?? '') !== String(after ?? '');
      });
      const item = {
        ...(existing ? { createdAt: existing.createdAt, updatedAt: changed ? now : existing.updatedAt } : {}),
        ...fields,
        deletedAt: null,
      };
      if (experience._id && mongoose.isValidObjectId(experience._id)) item._id = experience._id;
      return item;
    });

  return mergeSoftDeleted(existingExperiences, normalized, (experience) => ({
    _id: experience._id,
    createdAt: experience.createdAt,
    updatedAt: now,
    company: experience.company || '',
    role: experience.role || '',
    type: experience.type || 'full-time',
    location: experience.location || '',
    remote: experience.remote ?? false,
    startDate: experience.startDate ?? null,
    endDate: experience.endDate ?? null,
    description: experience.description || '',
    highlights: experience.highlights || [],
    skills: experience.skills || [],
    link: experience.link || '',
    order: experience.order ?? normalized.length,
    deletedAt: now,
  }), (experience) => experience._id);
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
    isImage: isImageFile(value),
  };
}

async function attachFiles(about, includeDetails = false) {
  if (!about) return null;
  const files = await File.find({
    parentEntity: 'about',
    parentId: about._id,
    deletedAt: null,
  }).sort({ order: 1, createdAt: 1 });
  // Every file is exposed: images feed the gallery, anything else (pdf, doc,
  // ...) is offered as a download on the public profile.
  about._doc.files = includeDetails ? files : files.map(publicFile);
  about._doc.educations = (about.educations || []).filter((education) => !education.deletedAt);
  about._doc.experiences = (about.experiences || []).filter((experience) => !experience.deletedAt);
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
  // The existing document is needed to preserve createdAt and to tombstone
  // educations/experiences the client no longer submits.
  const existing = await About.findOne({ deletedAt: null }).select('educations experiences');
  if (data.contacts !== undefined) data.contacts = normalizeContacts(data.contacts);
  if (data.skills !== undefined) data.skills = normalizeSkills(data.skills);
  if (data.educations !== undefined) data.educations = normalizeEducations(data.educations, existing?.educations || []);
  if (data.experiences !== undefined) data.experiences = normalizeExperiences(data.experiences, existing?.experiences || []);
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
