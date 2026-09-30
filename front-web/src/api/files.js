import { http } from './client.js';

export const filesApi = {
  list: (params) => http.get('/files', { params }),
  gallery: (params) => http.get('/files/gallery', { params }),
  upload: (parentEntity, parentId, file, onProgress, metadata = {}) => {
    const form = new FormData();
    form.append('parentEntity', parentEntity);
    form.append('parentId', parentId);
    form.append('file', file);
    if (metadata.order !== undefined) form.append('order', String(Number.isFinite(Number(metadata.order)) ? Number(metadata.order) : 0));
    if (metadata.title !== undefined) form.append('title', metadata.title);
    if (metadata.alt !== undefined) form.append('alt', metadata.alt);

    return http.post('/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress ? (e) => onProgress(e) : undefined,
    });
  },
  update: (id, data) => http.patch(`/files/${id}`, data),
  remove: (id) => http.delete(`/files/${id}`),
  uploadMany: async (parentEntity, parentId, files, onProgress, metadata = []) => {
    const uploadFiles = files || [];
    const uploaded = [];
    const completedFiles = [];
    try {
      for (const [index, file] of uploadFiles.entries()) {
        const fileMetadata = Array.isArray(metadata) ? metadata[index] || {} : metadata;
        const result = await filesApi.upload(parentEntity, parentId, file, (event) => {
          const percent = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
          onProgress?.({ file, index, total: uploadFiles.length, percent });
        }, fileMetadata);
        uploaded.push(result.file);
        completedFiles.push(file);
      }
      return uploaded;
    } catch (error) {
      error.uploaded = uploaded;
      error.completedFiles = completedFiles;
      throw error;
    }
  },
};
