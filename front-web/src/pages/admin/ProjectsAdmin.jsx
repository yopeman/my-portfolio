import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { projectsApi } from '../../api/projects.js';
import { Badge, Field, Select, TextArea, TextInput, ActionButton } from '../../components/admin/form.jsx';

const EMPTY = {
  name: '', slug: '', summary: '', description: '', problem: '', type: 'product', order: 0, tags: '',
};

export default function ProjectsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    projectsApi.list({ limit: 100 }).then((r) => setItems(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      order: Number(form.order) || 0,
    };
    delete payload._id;
    try {
      if (form._id) await projectsApi.update(form._id, payload);
      else await projectsApi.create(payload);
      setForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    await projectsApi.remove(item._id);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Projects</h1>
        <ActionButton variant="primary" onClick={() => setForm({ ...EMPTY })}>
          <Plus className="w-4 h-4" /> New project
        </ActionButton>
      </div>

      {form && (
        <form onSubmit={save} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {form._id ? 'Edit project' : 'New project'}
          </h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name"><TextInput value={form.name} onChange={set('name')} required /></Field>
            <Field label="Slug"><TextInput value={form.slug} onChange={set('slug')} placeholder="auto from name" /></Field>
            <Field label="Type">
              <Select value={form.type} onChange={set('type')} options={['product', 'case study', 'tutorial']} />
            </Field>
            <Field label="Order"><TextInput type="number" value={form.order} onChange={set('order')} /></Field>
            <Field label="Tags (comma-separated)" className="md:col-span-2">
              <TextInput value={form.tags} onChange={set('tags')} placeholder="Node.js, React, MongoDB" />
            </Field>
          </div>
          <Field label="Summary"><TextArea rows={2} value={form.summary} onChange={set('summary')} /></Field>
          <Field label="Problem"><TextArea rows={2} value={form.problem} onChange={set('problem')} /></Field>
          <Field label="Description (Markdown)"><TextArea rows={6} value={form.description} onChange={set('description')} /></Field>
          <div className="flex gap-2">
            <ActionButton variant="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</ActionButton>
            <ActionButton variant="neutral" type="button" onClick={() => setForm(null)}>Cancel</ActionButton>
          </div>
        </form>
      )}

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{item.slug}</td>
                <td className="px-4 py-3"><Badge tone="indigo">{item.type}</Badge></td>
                <td className="px-4 py-3 text-slate-500">{item.order}</td>
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
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No projects yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}