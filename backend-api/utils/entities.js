export const PARENT_ENTITIES = ['user', 'about', 'project', 'blog', 'plan'];
export const FEEDBACK_ENTITIES = ['about', 'project', 'blog', 'plan', 'system', 'feedback'];
export const REACTION_ENTITIES = ['about', 'project', 'blog', 'plan', 'system', 'feedback'];

// The site itself has no row to point at, so site-wide comments and reactions
// hang off this well-known id under parentEntity 'system'.
export const SYSTEM_PARENT_ID = '000000000000000000000001';

const RESOURCE_MAP = {
  user: 'users',
  about: 'about',
  project: 'projects',
  blog: 'blogs',
  plan: 'plans',
  // Site-wide threads are moderated by the people who run the site.
  system: 'users',
};

export function parentResource(entity) {
  return RESOURCE_MAP[entity] || null;
}

export function isSystemEntity(entity) {
  return entity === 'system';
}
