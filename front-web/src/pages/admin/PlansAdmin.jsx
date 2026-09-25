import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarRange, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { filesApi } from '../../api/files.js';
import { plansApi } from '../../api/plans.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, AttachmentField, Badge, Field, LoadingRows, Modal, SearchInput, Select, TableEmpty, TextArea, TextInput } from '../../components/admin/form.jsx';

const EMPTY = { title: '', slug: '', period: 'year', year: new Date().getFullYear(), description: '', goal: '', visibility: ['guest'], attachments: [], existingFiles: [] };
const PERIODS = ['year', 'half', 'quarter', 'month', 'week', 'day'];
const VISIBILITIES = ['guest', 'user', 'member', 'admin', 'owner'];

function toForm(item) {
  const visibility = Array.isArray(item.visibility) && item.visibility.length > 0 ? item.visibility : ['guest'];
  return { ...EMPTY, ...item, visibility, checklists: item.checklists || [], attachments: [], existingFiles: item.files || [] };
}

export default function PlansAdmin() {
  const { can } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingFileId, setRemovingFileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await plansApi.list({ limit: 100 });
      setItems(result.items || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load plans.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? items.filter((item) => `${item.title} ${item.slug} ${item.period}`.toLowerCase().includes(query)) : items;
  }, [items, search]);

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  async function removeAttachment(file) {
    if (!window.confirm(`Remove “${file.name || 'this attachment'}” from the plan?`)) return;
    setRemovingFileId(file._id);
    setError('');
    try {
      await filesApi.remove(file._id);
      setForm((value) => ({ ...value, existingFiles: value.existingFiles.filter((item) => item._id !== file._id) }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove attachment.');
    } finally {
      setRemovingFileId('');
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { attachments, ...payload } = form;
    delete payload.existingFiles;
    delete payload.files;
    payload.year = Number(form.year) || undefined;
    payload.visibility = Array.isArray(form.visibility) ? form.visibility : [form.visibility];
    payload.checklists = form.checklists || [];
    try {
      const result = form._id ? await plansApi.update(form._id, payload) : await plansApi.create(payload);
      const plan = result.plan;
      if (attachments.length > 0) {
        try {
          await filesApi.uploadMany('plan', plan._id, attachments);
        } catch (uploadError) {
          const completedFiles = new Set(uploadError.completedFiles || []);
          setForm((value) => ({ ...value, _id: plan._id, attachments: value.attachments.filter((file) => !completedFiles.has(file)), existingFiles: plan.files || value.existingFiles }));
          setError('Plan saved, but one or more attachments could not be uploaded. Try again.');
          return;
        }
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setError('');
    try {
      await plansApi.remove(item._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete plan.');
    }
  }

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Workspace / Planning" title="Plans" description="Organize your goals, milestones, and visibility in one place." actions={can('plans', 'CREATE') ? <ActionButton onClick={() => { setError(''); setForm({ ...EMPTY, visibility: ['guest'], attachments: [], existingFiles: [] }); }}><Plus className="h-4 w-4" /> New plan</ActionButton> : null} />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!form} onClose={() => !saving && setForm(null)} eyebrow={form?._id ? 'Editing plan' : 'New plan'} title="Plan the next milestone" description="Give the plan a clear outcome and audience.">
        {form && <form onSubmit={save}>
          <fieldset disabled={saving} className="space-y-6 border-0 p-0">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <div className="grid gap-5 md:grid-cols-3"><Field label="Title" className="md:col-span-2" required><TextInput value={form.title} onChange={set('title')} required autoFocus /></Field><Field label="Slug"><TextInput value={form.slug} onChange={set('slug')} placeholder="auto" /></Field><Field label="Period"><Select value={form.period} onChange={set('period')} options={PERIODS} /></Field><Field label="Year"><TextInput type="number" value={form.year} onChange={set('year')} /></Field><Field label="Visibility"><Select value={form.visibility?.[0] || 'guest'} onChange={(e) => setForm((value) => ({ ...value, visibility: [e.target.value] }))} options={VISIBILITIES} /></Field></div>
            <div className="h-px bg-slate-200/70 dark:bg-slate-800/70" />
            <Field label="Description"><TextArea rows={3} value={form.description} onChange={set('description')} /></Field>
            <Field label="Goal"><TextArea rows={4} value={form.goal} onChange={set('goal')} /></Field>
             <AttachmentField label="Plan attachments" hint="Upload images or supporting files here. They will be linked automatically after the plan is created." files={form.attachments} existingFiles={form.existingFiles} onChange={(attachments) => setForm((value) => ({ ...value, attachments }))} onRemoveExisting={can('plans', 'DELETE') ? removeAttachment : undefined} disabled={saving || !!removingFileId || !can('plans', 'UPDATE')} />

            <div className="flex justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setForm(null)}>Cancel</ActionButton><ActionButton type="submit" loading={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create plan'}</ActionButton></div>
          </fieldset>
        </form>}
      </Modal>

      <AdminPanel className="overflow-hidden">
        <AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">All plans <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Search your planning history.</p></div><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plans…" className="w-full sm:w-64" /></AdminToolbar>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">Plan</th><th className="hidden px-4 py-3 md:table-cell">Period</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Visible to</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <LoadingRows rows={5} /> : filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"><CalendarRange className="h-4 w-4" /></div><p className="font-bold text-slate-800 dark:text-slate-200">{item.title || 'Untitled plan'}</p></div></td><td className="hidden px-4 py-4 md:table-cell"><Badge tone="slate" dot>{item.period}</Badge></td><td className="px-4 py-4 text-slate-500">{item.year ?? '—'}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-1">{(item.visibility || []).map((visibility) => <Badge key={visibility} tone="indigo">{visibility}</Badge>)}</div></td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-1">{can('plans', 'UPDATE') && <ActionButton variant="subtle" aria-label={`Edit ${item.title}`} onClick={() => { setError(''); setForm(toForm(item)); }}><Pencil className="h-4 w-4" /></ActionButton>}{can('plans', 'DELETE') && <ActionButton variant="subtle" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton>}</div></td></tr>)}{!loading && filteredItems.length === 0 && <TableEmpty colSpan={5} icon={CalendarRange} title={search ? 'No matching plans' : 'No plans yet'} description={search ? 'Try a different search term.' : 'Create your first plan to get started.'} />}</tbody></table></div>
      </AdminPanel>
    </div>
  );
}
