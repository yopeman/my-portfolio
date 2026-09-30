export function formatDateValue(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleString();
}

export function formatBytesValue(value) {
  if (!Number.isFinite(Number(value))) return 'Not set';
  const bytes = Number(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function refLabel(ref, fallbackFields = ['name', 'title', 'email']) {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  for (const field of fallbackFields) {
    if (ref[field]) return String(ref[field]);
  }
  return ref._id ? String(ref._id) : '';
}

export function isPopulated(ref) {
  return Boolean(ref && typeof ref === 'object' && ref._id);
}
