export const PARENT_ENTITIES = ['user', 'about', 'project', 'blog', 'plan'];
export const FEEDBACK_ENTITIES = ['about', 'project', 'blog', 'plan', 'system', 'feedback'];
export const REACTION_ENTITIES = ['about', 'project', 'blog', 'plan', 'feedback'];

const RESOURCE_MAP = {
  user: 'users',
  about: 'about',
  project: 'projects',
  blog: 'blogs',
  plan: 'plans',
};

export function parentResource(entity) {
  return RESOURCE_MAP[entity] || null;
}