import { http } from './client.js';

export const feedbackApi = {
  list: (params) => http.get('/feedback', { params }),
  get: (id) => http.get(`/feedback/${id}`),
  create: (data) => http.post('/feedback', data),
  update: (id, data) => http.patch(`/feedback/${id}`, data),
  remove: (id) => http.delete(`/feedback/${id}`),
};