import { http } from './client.js';

export const filesApi = {
  list: (params) => http.get('/files', { params }),
  upload: (parentEntity, parentId, file, onProgress, title, alt) => {
    const form = new FormData();
    form.append('parentEntity', parentEntity);
    form.append('parentId', parentId);
    form.append('file', file);
    if (title) form.append('title', title);
    if (alt) form.append('alt', alt);

    return http.post('/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress ? (e) => onProgress(e) : undefined,
    });
  },
  update: (id, data) => http.patch(`/files/${id}`, data),
  remove: (id) => http.delete(`/files/${id}`),
};