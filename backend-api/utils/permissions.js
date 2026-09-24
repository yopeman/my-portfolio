export const RESOURCES = [
  'users',
  'about',
  'projects',
  'requests',
  'subscribers',
  'blogs',
  'plans',
];

export const ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE'];

const ALL = [...ACTIONS];
const NONE = [];

const map = (resources, actions) =>
  Object.fromEntries(resources.map((r) => [r, [...actions]]));

export const ROLE_DEFAULTS = {
  owner: map(RESOURCES, ALL),
  admin: map(RESOURCES, ALL),
  member: {
    ...map(RESOURCES, NONE),
    about: ['READ', 'UPDATE'],
    projects: ['READ', 'CREATE', 'UPDATE'],
    requests: ['READ', 'CREATE', 'UPDATE'],
    subscribers: ['READ'],
    blogs: ['READ', 'CREATE', 'UPDATE'],
    plans: ['READ', 'CREATE', 'UPDATE'],
  },
  user: map(RESOURCES, NONE),
};
