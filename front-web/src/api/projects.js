import { http } from './client.js';

export const projectsApi = {
  list: (params) => http.get('/projects', { params }),
  bySlug: (slug) => http.get(`/projects/${slug}`),
  create: (data) => http.post('/projects', data),
  update: (id, data) => http.patch(`/projects/${id}`, data),
  remove: (id) => http.delete(`/projects/${id}`),
};