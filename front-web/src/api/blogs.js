import { http } from './client.js';

export const blogsApi = {
  list: (params) => http.get('/blogs', { params }),
  bySlug: (slug) => http.get(`/blogs/${slug}`),
  create: (data) => http.post('/blogs', data),
  update: (id, data) => http.patch(`/blogs/${id}`, data),
  remove: (id) => http.delete(`/blogs/${id}`),
};