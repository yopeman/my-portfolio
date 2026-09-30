import { http } from './client.js';

export const systemApi = {
  get: () => http.get('/system'),
};
