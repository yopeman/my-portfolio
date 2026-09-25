import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { blogsApi } from '../../api/blogs.js';
import { Badge, Field, Select, TextArea, TextInput, ActionButton } from '../../components/admin/form.jsx';

const EMPTY = { title: '', slug: '', type: 'article', status: 'draft', excerpt: '', content: '', tags: '' };

const TYPE_TONE = { article: 'indigo', blog: 'green', event: 'amber' };
const STATUS_TONE = { published: 'green', draft: 'amber' };

export default function BlogsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    blogsApi.list({ limit: 100 }).then((r) => setItems(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    delete payload._id;
    try {
      if (form._id) await blogsApi.update(form._id, payload);
      else await blogsApi.create(payload);
      setForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    await blogsApi.remove(item._id);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Blogs</h1>
        <ActionButton variant="primary" onClick={() => setForm({ ...EMPTY })}>
          <Plus className="w-4 h-4" /> New post
        </ActionButton>
      </div>

      {form && (
        <form onSubmit={save} className="admin-surface rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{form._id ? 'Edit post' : 'New post'}</h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title"><TextInput value={form.title} onChange={set('title')} required /></Field>
            <Field label="Slug"><TextInput value={form.slug} onChange={set('slug')} placeholder="auto from title" /></Field>
            <Field label="Type"><Select value={form.type} onChange={set('type')} options={['article', 'blog', 'event']} /></Field>
            <Field label="Status"><Select value={form.status} onChange={set('status')} options={['draft', 'published']} /></Field>
            <Field label="Tags (comma-separated)" className="md:col-span-2">
              <TextInput value={form.tags} onChange={set('tags')} placeholder="AI, backend, tutorial" />
            </Field>
          </div>
          <Field label="Excerpt"><TextArea rows={2} value={form.excerpt} onChange={set('excerpt')} /></Field>
          <Field label="Content (Markdown)"><TextArea rows={12} value={form.content} onChange={set('content')} required /></Field>
          <div className="flex gap-2">
            <ActionButton variant="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</ActionButton>
            <ActionButton variant="neutral" type="button" onClick={() => setForm(null)}>Cancel</ActionButton>
          </div>
        </form>
      )}

      <div className="admin-surface rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.title}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{item.slug}</td>
                <td className="px-4 py-3"><Badge tone={TYPE_TONE[item.type] || 'slate'}>{item.type}</Badge></td>
                <td className="px-4 py-3"><Badge tone={STATUS_TONE[item.status] || 'slate'}>{item.status}</Badge></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <ActionButton variant="subtle" onClick={() => setForm({ ...EMPTY, ...item, tags: (item.tags || []).join(', ') })}>
                    <Pencil className="w-4 h-4" />
                  </ActionButton>
                  <ActionButton variant="subtle" onClick={() => remove(item)}>
                    <Trash2 className="w-4 h-4" />
                  </ActionButton>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}