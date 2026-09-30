import { http } from './client.js';

export const reactionsApi = {
  summary: (params) => http.get('/reactions', { params }),
  counts: (parentEntity, parentIds) => http.get('/reactions/counts', { params: { parentEntity, parentIds: (parentIds || []).join(',') } }),
  toggle: (data) => http.post('/reactions', data),
};