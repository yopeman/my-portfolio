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

function sortByOrder(items) {
  return (items || [])
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aOrder = Number(a.item.order);
      const bOrder = Number(b.item.order);
      const normalizedA = Number.isFinite(aOrder) ? aOrder : a.index;
      const normalizedB = Number.isFinite(bOrder) ? bOrder : b.index;
      return normalizedA - normalizedB || a.index - b.index;
    })
    .map(({ item }) => item);
}

function orderedFiles(files) {
  return (files || [])
    .map((file, index) => ({ file, index }))
    .sort((a, b) => {
      const aOrder = Number(a.file.order);
      const bOrder = Number(b.file.order);
      const normalizedA = Number.isFinite(aOrder) ? aOrder : a.index;
      const normalizedB = Number.isFinite(bOrder) ? bOrder : b.index;
      const createdDifference = new Date(a.file.createdAt || 0) - new Date(b.file.createdAt || 0);
      return normalizedA - normalizedB || createdDifference || a.index - b.index;
    })
    .map(({ file }) => file);
}

function orderedItems(items) {
  return sortByOrder(items);
}

function safeContactLink(value) {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

export function contactsToMarkdown(contacts) {
  if (!contacts?.length) return '';
  return sortByOrder(contacts)
    .map((contact) => {
      const label = [contact.name, contact.title && `(${contact.title})`].filter(Boolean).join(' ');
      const link = safeContactLink(contact.link);
      return `- ${label}${link ? `: ${link}` : ''}`;
    })
    .join('\n');
}

export function skillsToMarkdown(skills) {
  if (!skills?.length) return '';
  const orderedSkills = sortByOrder(skills);
  let md = '# Skills\n\n';
  let currentCategory;
  for (const skill of orderedSkills) {
    if (skill.category !== currentCategory) {
      currentCategory = skill.category;
      md += `## ${currentCategory}\n`;
    }
    md += `- ${skill.name}${skill.progress ? ` (${skill.progress}%)` : ''}\n`;
  }
  return md;
}

function safeLinks(links) {
  return (links || []).map((link) => {
    try {
      const url = new URL(String(link.link || '').trim());
      if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) return null;
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

function safeUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function educationsToList(educations) {
  return orderedItems(educations)
    .map((education) => ({
      _id: education._id,
      institution: education.institution || '',
      degree: education.degree || '',
      field: education.field || '',
      location: education.location || '',
      startDate: toIsoDate(education.startDate),
      endDate: toIsoDate(education.endDate),
      cgpa: Number.isFinite(Number(education.cgpa)) ? Number(education.cgpa) : null,
      description: education.description || '',
      link: safeUrl(education.link),
      order: education.order ?? 0,
    }))
    .filter((education) => education.institution || education.degree || education.field);
}

export function experiencesToList(experiences) {
  return orderedItems(experiences)
    .map((experience) => ({
      _id: experience._id,
      company: experience.company || '',
      role: experience.role || '',
      type: experience.type || 'full-time',
      location: experience.location || '',
      remote: Boolean(experience.remote),
      startDate: toIsoDate(experience.startDate),
      // A null endDate means the role is current.
      endDate: toIsoDate(experience.endDate),
      current: !toIsoDate(experience.endDate),
      description: experience.description || '',
      highlights: (experience.highlights || []).map(String).filter(Boolean),
      skills: (experience.skills || []).map(String).filter(Boolean),
      link: safeUrl(experience.link),
      order: experience.order ?? 0,
    }))
    .filter((experience) => experience.company || experience.role);
}

export function mapAboutLike(about) {
  const files = orderedFiles(about?.files);
  return {
    _id: about?._id || '',
    headline: about?.headline || '',
    about: about?.bio || '',
    contact: contactsToMarkdown(about?.contacts),
    skills: skillsToMarkdown(about?.skills),
    skillCount: Array.isArray(about?.skills) ? about.skills.length : 0,
    educations: educationsToList(about?.educations),
    experiences: experiencesToList(about?.experiences),
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
