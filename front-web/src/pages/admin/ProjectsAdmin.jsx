import { useCallback, useEffect, useMemo, useState } from 'react';
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { filesApi } from '../../api/files.js';
import { projectsApi } from '../../api/projects.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, AttachmentField, Badge, Field, LoadingRows, Modal, SearchInput, Select, TableEmpty, TextArea, TextInput } from '../../components/admin/form.jsx';

const featureDefaults = { name: '', description: '', order: 0 };
const linkDefaults = { type: '', link: '', order: 0 };

function emptyProject() {
  return {
    name: '', slug: '', summary: '', description: '', problem: '', solution: '', type: 'product', order: 0, tags: '',
    features: [{ ...featureDefaults }], stacks: [{ ...featureDefaults }], links: [{ ...linkDefaults }],
    attachments: [], attachmentMetadata: [], existingFiles: [], originalFiles: [],
  };
}

function repeaterItems(items, defaults) {
  if (!Array.isArray(items) || items.length === 0) return [{ ...defaults }];
  return items.map((item, index) => ({ ...defaults, ...(item || {}), order: item?.order ?? index }));
}

function toForm(item) {
  const existingFiles = (item.files || []).map((file) => ({ ...file }));
  return {
    ...emptyProject(),
    ...item,
    tags: (item.tags || []).join(', '),
    features: repeaterItems(item.features, featureDefaults),
    stacks: repeaterItems(item.stacks, featureDefaults),
    links: repeaterItems(item.links, linkDefaults),
    attachments: [],
    attachmentMetadata: [],
    existingFiles,
    originalFiles: existingFiles.map((file) => ({ ...file })),
  };
}

function cleanProjectItems(items, type) {
  return (items || []).filter((item) => (type === 'links' ? item.link?.trim() : item.name?.trim())).map((item, index) => {
    const order = Number(item.order);
    return {
      ...(type === 'links' ? { type: item.type?.trim().toLowerCase() || 'website', link: item.link.trim() } : { name: item.name.trim(), description: item.description?.trim() || '' }),
      order: item.order === '' || item.order === undefined || item.order === null || !Number.isFinite(order) ? index : order,
    };
  });
}

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleString();
}

function RepeaterField({ title, description, items, onAdd, onRemove, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{title}</h3><p className="mt-1 text-xs text-slate-400">{description}</p></div><ActionButton type="button" variant="neutral" onClick={onAdd}><Plus className="h-3.5 w-3.5" /> Add {title}</ActionButton></div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => <div key={`${title}-${index}`} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/70 dark:bg-slate-900/60"><div className="mb-3 flex justify-end"><ActionButton type="button" variant="subtle" onClick={() => onRemove(index)} aria-label={`Remove ${title} ${index + 1}`}><Trash2 className="h-3.5 w-3.5" /></ActionButton></div>{children(item, index)}</div>)}
      </div>
    </div>
  );
}

export default function ProjectsAdmin() {
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

  const updateRepeater = (collection, index, key, value) => setForm((current) => ({
    ...current,
    [collection]: current[collection].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
  }));

  const addRepeater = (collection) => setForm((current) => ({
    ...current,
    [collection]: [...current[collection], collection === 'links' ? { ...linkDefaults, order: current[collection].length } : { ...featureDefaults, order: current[collection].length }],
  }));

  const removeRepeater = (collection, index) => setForm((current) => ({
    ...current,
    [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index),
  }));

  const openCreate = () => {
    setError('');
    setForm(emptyProject());
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
    const { attachments, attachmentMetadata, existingFiles, originalFiles, ...payload } = form;
    delete payload._id;
    delete payload.files;
    payload.tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    payload.order = Number(form.order) || 0;
    payload.features = cleanProjectItems(form.features, 'features');
    payload.stacks = cleanProjectItems(form.stacks, 'stacks');
    payload.links = cleanProjectItems(form.links, 'links');
    try {
      const result = form._id ? await projectsApi.update(form._id, payload) : await projectsApi.create(payload);
      const project = result.project;
      const originalById = new Map((originalFiles || []).map((file) => [file._id, file]));
      const changedFiles = (existingFiles || []).filter((file) => {
        const original = originalById.get(file._id);
        return original && ['order', 'title', 'alt'].some((key) => String(file[key] ?? '') !== String(original[key] ?? ''));
      });
      try {
        if (changedFiles.length > 0) {
          await Promise.all(changedFiles.map((file) => filesApi.update(file._id, { order: Number(file.order) || 0, title: file.title || '', alt: file.alt || '' })));
        }
        if (attachments.length > 0) {
          await filesApi.uploadMany('project', project._id, attachments, undefined, attachmentMetadata);
        }
      } catch (uploadError) {
        const completedFiles = new Set(uploadError.completedFiles || []);
        setForm((value) => ({
          ...value,
          _id: project._id,
          attachments: value.attachments.filter((file) => !completedFiles.has(file)),
          attachmentMetadata: value.attachmentMetadata.filter((_, index) => !completedFiles.has(value.attachments[index])),
        }));
        setError('Project saved, but one or more attachment changes could not be saved. Try again.');
        return;
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
      <AdminHeader eyebrow="Content / Projects" title="Projects" description="Create, refine, and organize the work visitors see first." actions={can('projects', 'CREATE') ? <ActionButton onClick={openCreate}><Plus className="h-4 w-4" /> New project</ActionButton> : null} />

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
              <Field label="Problem solved" hint="What challenge did this project address?"><TextArea rows={3} value={form.problem} onChange={set('problem')} /></Field>
              <Field label="Solution" hint="Explain the approach and outcome."><TextArea rows={3} value={form.solution} onChange={set('solution')} /></Field>
            </div>
            <Field label="Description" hint="Markdown is supported."><TextArea rows={8} value={form.description} onChange={set('description')} /></Field>
            <Field label="Short summary" hint="One sentence for cards and previews."><TextArea rows={3} value={form.summary} onChange={set('summary')} /></Field>
            <RepeaterField title="Features" description="Add the key capabilities in this project." items={form.features} onAdd={() => addRepeater('features')} onRemove={(index) => removeRepeater('features', index)}>
              {(item, index) => <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_5rem]"><Field label="Name"><TextInput value={item.name} onChange={(event) => updateRepeater('features', index, 'name', event.target.value)} placeholder="Feature name" /></Field><Field label="Description"><TextInput value={item.description} onChange={(event) => updateRepeater('features', index, 'description', event.target.value)} placeholder="What it does" /></Field><Field label="Order"><TextInput type="number" min="0" value={item.order} onChange={(event) => updateRepeater('features', index, 'order', event.target.value === '' ? '' : Number(event.target.value))} /></Field></div>}
            </RepeaterField>
            <RepeaterField title="Stacks" description="Add the technologies and tools used." items={form.stacks} onAdd={() => addRepeater('stacks')} onRemove={(index) => removeRepeater('stacks', index)}>
              {(item, index) => <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_5rem]"><Field label="Name"><TextInput value={item.name} onChange={(event) => updateRepeater('stacks', index, 'name', event.target.value)} placeholder="Technology" /></Field><Field label="Description"><TextInput value={item.description} onChange={(event) => updateRepeater('stacks', index, 'description', event.target.value)} placeholder="How it is used" /></Field><Field label="Order"><TextInput type="number" min="0" value={item.order} onChange={(event) => updateRepeater('stacks', index, 'order', event.target.value === '' ? '' : Number(event.target.value))} /></Field></div>}
            </RepeaterField>
            <RepeaterField title="Links" description="Add GitHub, website, YouTube, or other project links." items={form.links} onAdd={() => addRepeater('links')} onRemove={(index) => removeRepeater('links', index)}>
              {(item, index) => <div className="grid gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_5rem]"><Field label="Type"><TextInput value={item.type} onChange={(event) => updateRepeater('links', index, 'type', event.target.value)} placeholder="github" /></Field><Field label="Link"><TextInput type="url" value={item.link} onChange={(event) => updateRepeater('links', index, 'link', event.target.value)} placeholder="https://…" /></Field><Field label="Order"><TextInput type="number" min="0" value={item.order} onChange={(event) => updateRepeater('links', index, 'order', event.target.value === '' ? '' : Number(event.target.value))} /></Field></div>}
            </RepeaterField>
             <div className="grid gap-5 md:grid-cols-3">
               <Field label="Created at"><TextInput disabled value={formatDate(form.createdAt)} /></Field>
               <Field label="Updated at"><TextInput disabled value={formatDate(form.updatedAt)} /></Field>
               <Field label="Deleted at"><TextInput disabled value={formatDate(form.deletedAt)} /></Field>
             </div>
             <AttachmentField label="Project files" hint="Upload project images or supporting files. Set title, alt text, and order for each file." files={form.attachments} existingFiles={form.existingFiles} metadata={form.attachmentMetadata} onChange={(attachments) => setForm((value) => ({ ...value, attachments }))} onMetadataChange={(attachmentMetadata) => setForm((value) => ({ ...value, attachmentMetadata }))} onExistingChange={(existingFiles) => setForm((value) => ({ ...value, existingFiles }))} onRemoveExisting={can('projects', 'DELETE') ? removeAttachment : undefined} showMetadata disabled={saving || !!removingFileId || !can('projects', 'UPDATE')} />

            <p className="text-[10px] leading-relaxed text-slate-400">Project timestamps and file parent information are generated automatically when the record is saved.</p>
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
              {loading ? <LoadingRows rows={5} /> : filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><FolderKanban className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate font-bold text-slate-800 dark:text-slate-200">{item.name || 'Untitled project'}</p><p className="truncate text-xs text-slate-400 md:hidden">{item.slug || 'No slug'}</p></div></div></td><td className="hidden max-w-48 truncate px-4 py-4 text-slate-500 md:table-cell">{item.slug || '—'}</td><td className="px-4 py-4"><Badge tone="indigo" dot>{item.type}</Badge></td><td className="px-4 py-4 font-semibold text-slate-500">{item.order ?? 0}</td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-1">{can('projects', 'UPDATE') && <ActionButton variant="subtle" aria-label={`Edit ${item.name}`} onClick={() => { setError(''); setForm(toForm(item)); }}><Pencil className="h-4 w-4" /></ActionButton>}{can('projects', 'DELETE') && <ActionButton variant="subtle" aria-label={`Delete ${item.name}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton>}</div></td></tr>)}
              {!loading && filteredItems.length === 0 && <TableEmpty colSpan={5} icon={FolderKanban} title={search ? 'No matching projects' : 'No projects yet'} description={search ? 'Try a different search term.' : 'Create your first project to start building your portfolio.'} />}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
