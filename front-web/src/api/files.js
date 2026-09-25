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
  uploadMany: async (parentEntity, parentId, files, onProgress) => {
    const uploadFiles = files || [];
    const uploaded = [];
    for (const [index, file] of uploadFiles.entries()) {
      const result = await filesApi.upload(parentEntity, parentId, file, (event) => {
        const percent = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
        onProgress?.({ file, index, total: uploadFiles.length, percent });
      });
      uploaded.push(result.file);
    }
    return uploaded;
  },
};
