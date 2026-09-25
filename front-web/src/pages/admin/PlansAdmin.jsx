import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { plansApi } from '../../api/plans.js';
import { Badge, Field, Select, TextArea, TextInput, ActionButton } from '../../components/admin/form.jsx';

const EMPTY = { title: '', slug: '', period: 'year', year: new Date().getFullYear(), description: '', goal: '', visibility: ['guest'] };
const PERIODS = ['year', 'half', 'quarter', 'month', 'week', 'day'];

export default function PlansAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    plansApi.list({ limit: 100 }).then((r) => setItems(r.items)).catch(() => {});
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
      year: Number(form.year) || undefined,
      visibility: typeof form.visibility === 'string' ? [form.visibility] : form.visibility,
      checklists: form.checklists || [],
    };
    delete payload._id;
    try {
      if (form._id) await plansApi.update(form._id, payload);
      else await plansApi.create(payload);
      setForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    await plansApi.remove(item._id);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Plans</h1>
        <ActionButton variant="primary" onClick={() => setForm({ ...EMPTY })}>
          <Plus className="w-4 h-4" /> New plan
        </ActionButton>
      </div>

      {form && (
        <form onSubmit={save} className="admin-surface rounded-2xl p-5 space-y-4 max-w-2xl">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{form._id ? 'Edit plan' : 'New plan'}</h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Title" className="md:col-span-2"><TextInput value={form.title} onChange={set('title')} required /></Field>
            <Field label="Slug"><TextInput value={form.slug} onChange={set('slug')} placeholder="auto" /></Field>
            <Field label="Period"><Select value={form.period} onChange={set('period')} options={PERIODS} /></Field>
            <Field label="Year"><TextInput type="number" value={form.year} onChange={set('year')} /></Field>
            <Field label="Visibility">
              <Select value={form.visibility[0] || 'guest'} onChange={(e) => setForm((f) => ({ ...f, visibility: [e.target.value] }))} options={['guest', 'user', 'member', 'admin', 'owner']} />
            </Field>
          </div>
          <Field label="Description"><TextArea rows={2} value={form.description} onChange={set('description')} /></Field>
          <Field label="Goal"><TextArea rows={2} value={form.goal} onChange={set('goal')} /></Field>
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
              <th className="px-4 py-3 hidden sm:table-cell">Period</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Visible to</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.title}</td>
                <td className="px-4 py-3 hidden sm:table-cell"><Badge tone="slate">{item.period}</Badge></td>
                <td className="px-4 py-3 text-slate-500">{item.year ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{(item.visibility || []).join(', ')}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <ActionButton variant="subtle" onClick={() => setForm({ ...EMPTY, ...item, visibility: item.visibility || ['guest'] })}>
                    <Pencil className="w-4 h-4" />
                  </ActionButton>
                  <ActionButton variant="subtle" onClick={() => remove(item)}>
                    <Trash2 className="w-4 h-4" />
                  </ActionButton>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No plans yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}