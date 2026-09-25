import {
  aboutMe as staticAbout,
  projects as staticProjects,
} from '../data/portfolioData.js';

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

function linksToCard(links) {
  const card = {};
  for (const link of links || []) {
    if (link.type === 'github') card.repository = link.link;
    if (link.type === 'website') card.website = link.link;
    if (link.type === 'youtube') card.youtube = link.link;
  }
  return card;
}

export function mapAboutLike(about) {
  const files = about?.files || [];
  return {
    about: about?.bio || staticAbout.about,
    contact: contactsToMarkdown(about?.contacts),
    skills: skillsToMarkdown(about?.skills),
    images: files.length ? files.map((f) => f.path) : staticAbout.images,
  };
}

export function projectToCard(project) {
  return {
    _id: project._id,
    id: project.slug,
    slug: project.slug,
    title: project.name,
    summary: project.summary || project.description,
    readme: project.description || project.summary,
    problem: project.problem,
    tags: project.tags || [],
    stacks: project.stacks || project.tags.map((tag, i) => ({ name: tag, order: i })),
    features: project.features || [],
    type: project.type || 'product',
    order: project.order,
    ...linksToCard(project.links),
    images: (project.files || []).map((f) => f.path),
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
  };
}

export function staticProjectsAsCards() {
  return staticProjects.map((p) => ({
    ...p,
    id: p.id,
    slug: p.id,
    readme: p.readme,
    folderName: p.folderName,
  }));
}