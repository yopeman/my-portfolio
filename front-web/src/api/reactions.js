import { http } from './client.js';

export const reactionsApi = {
  summary: (params) => http.get('/reactions', { params }),
  toggle: (data) => http.post('/reactions', data),
};