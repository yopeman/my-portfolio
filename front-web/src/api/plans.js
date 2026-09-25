import { http } from './client.js';

export const plansApi = {
  list: (params) => http.get('/plans', { params }),
  options: () => http.get('/plans/options'),
  assignees: () => http.get('/plans/assignees'),
  bySlug: (slug) => http.get(`/plans/${slug}`),
  checklists: (slug) => http.get(`/plans/${slug}/checklists`),
  create: (data) => http.post('/plans', data),
  update: (id, data) => http.patch(`/plans/${id}`, data),
  remove: (id) => http.delete(`/plans/${id}`),
};