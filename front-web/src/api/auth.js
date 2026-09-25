import { http } from './client.js';

export const authApi = {
  register: (data) => http.post('/auth/register', data),
  login: (data) => http.post('/auth/login', data),
  me: () => http.get('/auth/me'),
  updateMe: (data) => http.patch('/auth/me', data),
};