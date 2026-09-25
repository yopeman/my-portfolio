import { BASE_URL } from '../data/constants.js';

export function resolveFileUrl(path) {
  if (!path) return '';
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;
  return `${BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function fileUrl(file) {
  return resolveFileUrl(file.fileUrl || file.path);
}

function isImageFile(file) {
  if (file.mimeType) return file.mimeType.startsWith('image/');
  return /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(file.path || file.fileUrl || '');
}

function orderedFiles(files) {
  return [...(files || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function orderedItems(items) {
  return [...(items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function contactsToMarkdown(contacts) {
  if (!contacts?.length) return '';
  return contacts.map((c) => `- ${c.title || c.name}: ${c.link}`).join('\n');
}

export function skillsToMarkdown(skills) {
  if (!skills?.length) return '';
  let md = '# Skills\n\n';
  let currentCategory;
  for (const skill of skills) {
    if (skill.category !== currentCategory) {
      currentCategory = skill.category;
      md += `## ${currentCategory}\n`;
    }
    md += `- ${skill.name}\n`;
  }
  return md;
}

function safeLinks(links) {
  return (links || []).map((link) => {
    try {
      const url = new URL(String(link.link || '').trim());
      if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return null;
      return { ...link, link: url.toString() };
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function linksToCard(links) {
  const normalizedLinks = safeLinks(links);
  const card = { links: normalizedLinks };
  for (const link of normalizedLinks) {
    const type = String(link.type || '').toLowerCase();
    if (type === 'github') card.repository = link.link;
    if (type === 'website') card.website = link.link;
    if (type === 'youtube') card.youtube = link.link;
  }
  return card;
}

export function mapAboutLike(about) {
  const files = orderedFiles(about?.files);
  return {
    headline: about?.headline || '',
    about: about?.bio || '',
    contact: contactsToMarkdown(about?.contacts),
    skills: skillsToMarkdown(about?.skills),
    images: files.filter(isImageFile).map(fileUrl).filter(Boolean),
  };
}

export function projectToCard(project) {
  const tags = project.tags || [];
  return {
    _id: project._id,
    id: project.slug,
    slug: project.slug,
    title: project.name,
    summary: project.summary || project.description || '',
    readme: project.description || project.summary || '',
    problem: project.problem,
    tags,
    stacks: project.stacks?.length ? orderedItems(project.stacks) : tags.map((tag, i) => ({ name: tag, order: i })),
    features: orderedItems(project.features),
    type: project.type || 'product',
    order: project.order,
    ...linksToCard(project.links),
    images: orderedFiles(project.files).filter(isImageFile).map(fileUrl).filter(Boolean),
    folderName: project.name,
  };
}

export function blogToCard(blog) {
  return {
    _id: blog._id,
    id: blog.slug,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    tags: blog.tags || [],
    type: blog.type || 'article',
    publishedAt: blog.publishedAt,
    readingTime: blog.readingTime,
    links: safeLinks(blog.links),
  };
}
