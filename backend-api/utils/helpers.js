export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function pick(obj, fields) {
  const out = {};
  for (const field of fields) {
    if (obj[field] !== undefined) out[field] = obj[field];
  }
  return out;
}