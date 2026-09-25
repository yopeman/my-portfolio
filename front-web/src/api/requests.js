import { http } from './client.js';

export const requestsApi = {
  listMine: (params) => http.get('/requests', { params }),
  listAll: (params) => http.get('/requests/all', { params }),
  create: (data) => http.post('/requests', data),
  update: (id, data) => http.patch(`/requests/${id}`, data),
  remove: (id) => http.delete(`/requests/${id}`),
};