import { http } from './client.js';

export const subscribersApi = {
  list: (params) => http.get('/subscribers', { params }),
  subscribe: (data) => http.post('/subscribers', data),
  unsubscribe: (id) => http.post(`/subscribers/${id}/unsubscribe`),
  remove: (id) => http.delete(`/subscribers/${id}`),
};