import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { About, File, Project, User } from '../models/index.js';
import { defaultPermissionsForRole, hashPassword } from '../services/auth.service.js';
import { aboutMe, projects } from '../data/portfolioData.js';

function parseContactMarkdown(text) {
  return text
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line, i) => {
      const [key, ...rest] = line.slice(2).split(':');
      return { name: key.trim(), title: key.trim(), link: rest.join(':').trim(), order: i };
    });
}

function parseSkillMarkdown(text) {
  const skills = [];
  let category = null;
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      category = line.slice(3).trim();
    } else if (line.startsWith('- ')) {
      skills.push({ category, name: line.slice(2).trim(), order: skills.length });
    }
  }
  return skills;
}

function section(text, header) {
  const match = text.match(new RegExp(`###\\s*${header}\\s*\\n([\\s\\S]*?)(?:\\n###|$)`, 'i'));
  return match ? match[1].trim() : undefined;
}

function mimeTypeForPath(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', pdf: 'application/pdf',
  };
  return map[ext] || 'application/octet-stream';
}

async function seedOwner() {
  const { ownerEmail, ownerPassword, ownerName } = env.seed;

  let owner = await User.findOne({ email: ownerEmail }).sort({ createdAt: 1 });
  if (!owner) owner = await User.findOne({ role: 'owner' }).sort({ createdAt: 1 });

  if (owner) {
    owner.deletedAt = null;
    owner.role = 'owner';
    if (!owner.name) owner.name = ownerName;
    await owner.save();
    console.log(`[owner] ensured owner: ${owner.email} (${owner.role})`);
    return;
  }

  const permissions = new Map();
  for (const [resource, actions] of Object.entries(defaultPermissionsForRole('owner'))) {
    permissions.set(resource, actions);
  }

  await User.create({
    name: ownerName,
    email: ownerEmail,
    passwordHash: await hashPassword(ownerPassword),
    role: 'owner',
    permissions,
  });
  console.log(`[owner] created owner: ${ownerEmail} (password from SEED_OWNER_PASSWORD)`);
}

async function seedAbout() {
  const patch = {
    bio: aboutMe.about.trim(),
    headline: 'Backend-Focused Software Developer',
    contacts: parseContactMarkdown(aboutMe.contact),
    skills: parseSkillMarkdown(aboutMe.skills),
    deletedAt: null,
  };

  let about = await About.findOne({}).sort({ createdAt: 1 });
  if (about) {
    Object.assign(about, patch);
    await about.save();
  } else {
    about = await About.create(patch);
  }

  await File.deleteMany({ parentEntity: 'about' });
  await File.insertMany(
    aboutMe.images.map((image, i) => ({
      parentEntity: 'about',
      parentId: about._id,
      order: i,
      title: image.split('/').pop(),
      name: image.split('/').pop(),
      path: image,
      mimeType: mimeTypeForPath(image),
    }))
  );
  console.log(`[about] synced about (${aboutMe.images.length} images, ${patch.skills.length} skills, ${patch.contacts.length} contacts)`);
}

async function seedProjects() {
  for (let i = 0; i < projects.length; i += 1) {
    const p = projects[i];

    const stacks = p.tags.map((tag, si) => ({ name: tag.replace(/^\*\s*/, ''), order: si }));
    const links = [];
    if (p.repository) links.push({ type: 'github', link: p.repository, order: links.length });
    if (p.website) links.push({ type: 'website', link: p.website, order: links.length });

    const patch = {
      name: p.title,
      slug: p.id,
      summary: p.summary,
      description: p.readme,
      problem: section(p.readme, 'What it solves'),
      order: i,
      tags: p.tags.map((tag) => tag.replace(/^\*\s*/, '')),
      stacks,
      links,
      deletedAt: null,
    };

    let project = await Project.findOne({ slug: p.id }).sort({ createdAt: 1 });
    if (project) {
      Object.assign(project, patch);
      await project.save();
    } else {
      project = await Project.create(patch);
    }

    await File.deleteMany({ parentEntity: 'project', parentId: project._id });
    const files = p.images.map((image, j) => ({
      parentEntity: 'project',
      parentId: project._id,
      order: j,
      title: image.split('/').pop(),
      name: image.split('/').pop(),
      path: image,
      mimeType: mimeTypeForPath(image),
    }));
    if (files.length) await File.insertMany(files);

    console.log(`[project] synced ${project.slug} (${files.length} images)`);
  }
}

async function run() {
  await connectDB();
  try {
    console.log('=== Seeding portfolio database ===');
    await seedOwner();
    await seedAbout();
    await seedProjects();
    const summary = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      About.countDocuments({ deletedAt: null }),
      Project.countDocuments({ deletedAt: null }),
      File.countDocuments({ deletedAt: null }),
    ]);
    console.log('=== Done ===');
    console.log(`users=${summary[0]} about=${summary[1]} projects=${summary[2]} files=${summary[3]}`);
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await disconnectDB();
  }
}

run();