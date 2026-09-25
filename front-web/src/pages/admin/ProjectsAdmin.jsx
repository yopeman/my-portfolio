import { useCallback, useEffect, useMemo, useState } from 'react';
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { filesApi } from '../../api/files.js';
import { projectsApi } from '../../api/projects.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, AttachmentField, Badge, Field, LoadingRows, Modal, SearchInput, Select, TableEmpty, TextArea, TextInput } from '../../components/admin/form.jsx';

const EMPTY = {
  name: '', slug: '', summary: '', description: '', problem: '', type: 'product', order: 0, tags: '', attachments: [], existingFiles: [],
};

function toForm(item) {
  return { ...EMPTY, ...item, tags: (item.tags || []).join(', '), attachments: [], existingFiles: item.files || [] };
}

export default function ProjectsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingFileId, setRemovingFileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await projectsApi.list({ limit: 100 });
      setItems(result.items || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load projects.');
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
    if (!query) return items;
    return items.filter((item) => `${item.name} ${item.slug} ${item.type}`.toLowerCase().includes(query));
  }, [items, search]);

  const set = (key) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreate = () => {
    setError('');
    setForm({ ...EMPTY, attachments: [], existingFiles: [] });
  };

  async function removeAttachment(file) {
    if (!window.confirm(`Remove “${file.name || 'this attachment'}” from the project?`)) return;
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
    payload.tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    payload.order = Number(form.order) || 0;
    try {
      const result = form._id ? await projectsApi.update(form._id, payload) : await projectsApi.create(payload);
      const project = result.project;
      if (attachments.length > 0) {
        try {
          await filesApi.uploadMany('project', project._id, attachments);
        } catch {
          setForm((value) => ({ ...value, _id: project._id, existingFiles: project.files || value.existingFiles }));
          setError('Project saved, but one or more attachments could not be uploaded. Try again.');
          return;
        }
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return;
    setError('');
    try {
      await projectsApi.remove(item._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete project.');
    }
  }

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Content / Projects" title="Projects" description="Create, refine, and organize the work visitors see first." actions={<ActionButton onClick={openCreate}><Plus className="h-4 w-4" /> New project</ActionButton>} />

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!form} onClose={() => !saving && setForm(null)} eyebrow={form?._id ? 'Editing project' : 'New project'} title={form?._id ? 'Update project details' : 'Add a project to your portfolio'} description="Use clear, specific language to make your work easy to scan.">
        {form && <form onSubmit={save}>
          <fieldset disabled={saving} className="space-y-6 border-0 p-0">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Project name" required hint="The headline shown on project cards."><TextInput value={form.name} onChange={set('name')} required autoFocus /></Field>
              <Field label="Slug" hint="Leave blank to use the name automatically."><TextInput value={form.slug} onChange={set('slug')} placeholder="auto from name" /></Field>
              <Field label="Project type"><Select value={form.type} onChange={set('type')} options={[{ value: 'product', label: 'Product' }, { value: 'case study', label: 'Case study' }, { value: 'tutorial', label: 'Tutorial' }]} /></Field>
              <Field label="Display order" hint="Lower numbers appear first."><TextInput type="number" value={form.order} onChange={set('order')} /></Field>
              <Field label="Tags" className="md:col-span-2" hint="Separate tags with commas."><TextInput value={form.tags} onChange={set('tags')} placeholder="Node.js, React, MongoDB" /></Field>
            </div>
            <div className="h-px bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Short summary" hint="One sentence for cards and previews."><TextArea rows={3} value={form.summary} onChange={set('summary')} /></Field>
              <Field label="Problem solved" hint="What challenge did this project address?"><TextArea rows={3} value={form.problem} onChange={set('problem')} /></Field>
            </div>
            <Field label="Description" hint="Markdown is supported."><TextArea rows={8} value={form.description} onChange={set('description')} /></Field>
            <AttachmentField label="Project attachments" hint="Upload images or supporting files here. They will be linked automatically after the project is created." files={form.attachments} existingFiles={form.existingFiles} onChange={(attachments) => setForm((value) => ({ ...value, attachments }))} onRemoveExisting={(file) => removeAttachment(file)} disabled={saving || !!removingFileId} />
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setForm(null)}>Cancel</ActionButton><ActionButton type="submit" loading={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create project'}</ActionButton></div>
          </fieldset>
        </form>}
      </Modal>

      <AdminPanel className="overflow-hidden">
        <AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">All projects <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Search and manage your project library.</p></div><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…" className="w-full sm:w-64" /></AdminToolbar>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">Project</th><th className="hidden px-4 py-3 md:table-cell">Slug</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Order</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <LoadingRows rows={5} /> : filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><FolderKanban className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate font-bold text-slate-800 dark:text-slate-200">{item.name || 'Untitled project'}</p><p className="truncate text-xs text-slate-400 md:hidden">{item.slug || 'No slug'}</p></div></div></td><td className="hidden max-w-48 truncate px-4 py-4 text-slate-500 md:table-cell">{item.slug || '—'}</td><td className="px-4 py-4"><Badge tone="indigo" dot>{item.type}</Badge></td><td className="px-4 py-4 font-semibold text-slate-500">{item.order ?? 0}</td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-1"><ActionButton variant="subtle" aria-label={`Edit ${item.name}`} onClick={() => { setError(''); setForm(toForm(item)); }}><Pencil className="h-4 w-4" /></ActionButton><ActionButton variant="subtle" aria-label={`Delete ${item.name}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton></div></td></tr>)}
              {!loading && filteredItems.length === 0 && <TableEmpty colSpan={5} icon={FolderKanban} title={search ? 'No matching projects' : 'No projects yet'} description={search ? 'Try a different search term.' : 'Create your first project to start building your portfolio.'} />}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
