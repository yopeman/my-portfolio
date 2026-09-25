export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageMeta(page, limit, total) {
  return { page, limit, total, pages: Math.ceil(total / limit) };
}