import { Blog, File } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick, slugify } from '../utils/helpers.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';
import { hasPermission } from '../utils/permissions.js';

async function attachFiles(blogs) {
  if (!blogs.length) return;
  const ids = blogs.map((blog) => blog._id);
  const files = await File.find({
    parentEntity: 'blog',
    parentId: { $in: ids },
    deletedAt: null,
  }).sort({ order: 1, createdAt: 1 });
  const byParent = new Map();
  for (const file of files) {
    const key = file.parentId.toString();
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(file);
  }
  for (const blog of blogs) {
    blog._doc.files = byParent.get(blog._id.toString()) || [];
  }
}

const BLOG_FIELDS = ['slug', 'type', 'title', 'content', 'excerpt', 'tags', 'status', 'links'];

function computeReadingTime(content) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function publicFilter(query, isStaff) {
  const filter = { deletedAt: null };
  if (query.type) filter.type = query.type;
  if (query.tag) filter.tags = query.tag;
  if (query.status) filter.status = query.status;
  else if (!isStaff) filter.status = 'published';
  return filter;
}

export const listBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const isStaff = !!req.user && hasPermission(req.user, 'blogs', 'READ');
  const filter = publicFilter(req.query, isStaff);
  const [items, total] = await Promise.all([
    Blog.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
    Blog.countDocuments(filter),
  ]);
  await attachFiles(items);
  return res.json({ items, meta: pageMeta(page, limit, total) });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, deletedAt: null });
  if (!blog) throw ApiError.notFound('Blog not found');
  await attachFiles([blog]);
  return res.json({ blog });
});

export const createBlog = asyncHandler(async (req, res) => {
  const data = pick(req.body, BLOG_FIELDS);
  if (!data.title) throw ApiError.badRequest('title is required');
  if (!data.slug) data.slug = slugify(data.title) || data.title.toLowerCase().replace(/\s+/g, '-');

  const status = data.status || 'published';
  data.status = status;
  data.author = req.user._id;
  data.readingTime = computeReadingTime(data.content);
  if (status === 'published' && !data.publishedAt) data.publishedAt = new Date();

  const blog = await Blog.create(data);
  await attachFiles([blog]);
  return res.status(201).json({ blog });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const data = pick(req.body, BLOG_FIELDS);
  if (Object.keys(data).length === 0) throw ApiError.badRequest('No updatable fields provided');
  if (data.slug) data.slug = slugify(data.slug) || data.slug;

  const existing = await Blog.findOne({ _id: req.params.id, deletedAt: null });
  if (!existing) throw ApiError.notFound('Blog not found');

  if (data.content !== undefined) data.readingTime = computeReadingTime(data.content);
  if (data.status === 'published' && !existing.publishedAt) data.publishedAt = new Date();

  const blog = await Blog.findByIdAndUpdate(existing._id, data, { new: true, runValidators: true });
  await attachFiles([blog]);
  return res.json({ blog });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, deletedAt: null });
  if (!blog) throw ApiError.notFound('Blog not found');
  await Blog.findByIdAndUpdate(blog._id, { deletedAt: new Date() });
  return res.json({ success: true });
});