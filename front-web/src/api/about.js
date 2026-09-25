import { http } from './client.js';

export const aboutApi = {
  get: () => http.get('/about'),
  update: (data) => http.put('/about', data),
};