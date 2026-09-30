import { http } from './client.js';

export const usersApi = {
  list: (params) => http.get('/users', { params }),
  create: (data) => http.post('/users', data),
  get: (id) => http.get(`/users/${id}`),
  update: (id, data) => http.patch(`/users/${id}`, data),
  remove: (id) => http.delete(`/users/${id}`),
};