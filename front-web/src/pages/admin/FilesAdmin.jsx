import { useCallback, useEffect, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { filesApi } from '../../api/files.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Badge, Field, Select, TextInput, ActionButton } from '../../components/admin/form.jsx';

const PARENTS = ['project', 'blog', 'about', 'plan'];

function parentHref(parentEntity, parentId) {
  if (!parentId || parentEntity === 'about') return null;
  const bySlug = { project: '/projects/', blog: '/blogs/' };
  const prefix = bySlug[parentEntity];
  if (!prefix) return null;
  try {
    return `/admin/${parentEntity}s?q=${parentId}`;
  } catch {
    return null;
  }
}

export default function FilesAdmin() {
  const { can } = useAuth();
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ parentEntity: 'project', parentId: '', title: '', alt: '', file: null });

  const load = useCallback(() => {
    filesApi.list({ limit: 100 }).then((r) => setItems(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function upload(e) {
    e.preventDefault();
    if (!form.parentId || !form.file) {
      setError('Parent ID and file are required.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await filesApi.upload(form.parentEntity, form.parentId, form.file, undefined, form.title || undefined, form.alt || undefined);
      setForm({ parentEntity: 'project', parentId: '', title: '', alt: '', file: null });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function remove(item) {
    await filesApi.remove(item._id);
    load();
  }

  const isImage = (mime) => (mime || '').startsWith('image/');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Files</h1>

      {can('about', 'UPDATE') && (
        <form onSubmit={upload} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Upload file</h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="Parent entity">
              <Select value={form.parentEntity} onChange={set('parentEntity')} options={PARENTS} />
            </Field>
            <Field label="Parent ID">
              <TextInput value={form.parentId} onChange={set('parentId')} required placeholder="object id" />
            </Field>
            <Field label="Title"><TextInput value={form.title} onChange={set('title')} /></Field>
            <Field label="File">
              <input
                type="file"
                onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                className="w-full text-sm text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
              />
            </Field>
          </div>
          <Field label="Alt text (images)">
            <TextInput value={form.alt} onChange={set('alt')} placeholder="Descriptive alt text" />
          </Field>
          <ActionButton variant="primary" type="submit" disabled={uploading}>
            <Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload'}
          </ActionButton>
        </form>
      )}

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 hidden sm:table-cell">Parent</th>
              <th className="px-4 py-3 hidden md:table-cell">Size</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-2">
                  {isImage(item.mimeType) ? (
                    <img
                      src={item.fileUrl || item.path || ''}
                      alt={item.alt || item.name}
                      className="w-14 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <span className="inline-flex w-14 h-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                      {item.name?.split('.').pop()}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{item.alt || item.title || item.name}</p>
                  <p className="text-xs text-slate-400">{item.name}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Badge tone="indigo">{item.parentEntity}</Badge>
                  <span className="ml-1 text-xs text-slate-400">{parentHref(item.parentEntity, item.parentId) ?? item.parentId?.slice(0, 8)}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-500">
                  {item.size != null ? `${(item.size / 1024).toFixed(0)} KB` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {can('about', 'DELETE') && (
                    <ActionButton variant="subtle" onClick={() => remove(item)}>
                      <Trash2 className="w-4 h-4" />
                    </ActionButton>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No files yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}