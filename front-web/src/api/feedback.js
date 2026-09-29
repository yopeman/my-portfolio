import { http } from './client.js';

export const feedbackApi = {
  list: (params) => http.get('/feedback', { params }),
  listAll: (params) => http.get('/feedback/all', { params }),
  counts: (parentEntity, parentIds) => http.get('/feedback/counts', { params: { parentEntity, parentIds: (parentIds || []).join(',') } }),
  replies: (parentIds) => http.get('/feedback/replies', { params: { parentIds: (parentIds || []).join(',') } }),
  get: (id) => http.get(`/feedback/${id}`),
  create: (data) => http.post('/feedback', data),
  update: (id, data) => http.patch(`/feedback/${id}`, data),
  remove: (id) => http.delete(`/feedback/${id}`),
};