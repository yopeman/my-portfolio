import { http } from './client.js';

export const aiApi = {
  enhance: (payload) => http.post('/ai/enhance', payload),
  capabilities: () => http.get('/ai/capabilities'),
};
