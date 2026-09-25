import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { filesApi } from '../../api/files.js';
import { blogsApi } from '../../api/blogs.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, AttachmentField, Badge, Field, LoadingRows, Modal, SearchInput, Select, TableEmpty, TextArea, TextInput } from '../../components/admin/form.jsx';

const EMPTY = { title: '', slug: '', type: 'article', status: 'draft', excerpt: '', content: '', tags: '', attachments: [], existingFiles: [] };
const TYPE_TONE = { article: 'indigo', blog: 'green', event: 'amber' };
const STATUS_TONE = { published: 'green', draft: 'amber' };

function toForm(item) {
  return { ...EMPTY, ...item, tags: (item.tags || []).join(', '), attachments: [], existingFiles: item.files || [] };
}

export default function BlogsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingFileId, setRemovingFileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await blogsApi.list({ limit: 100 });
      setItems(result.items || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load posts.');
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
    return items.filter((item) => {
      const matchesQuery = !query || `${item.title} ${item.slug} ${item.type}`.toLowerCase().includes(query);
      return matchesQuery && (!status || item.status === status);
    });
  }, [items, search, status]);

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  async function removeAttachment(file) {
    if (!window.confirm(`Remove “${file.name || 'this attachment'}” from the post?`)) return;
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
    try {
      const result = form._id ? await blogsApi.update(form._id, payload) : await blogsApi.create(payload);
      const blog = result.blog;
      if (attachments.length > 0) {
        try {
          await filesApi.uploadMany('blog', blog._id, attachments);
        } catch {
          setForm((value) => ({ ...value, _id: blog._id, existingFiles: blog.files || value.existingFiles }));
          setError('Post saved, but one or more attachments could not be uploaded. Try again.');
          return;
        }
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setError('');
    try {
      await blogsApi.remove(item._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete post.');
    }
  }

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Content / Writing" title="Blogs" description="Shape your ideas into clear, useful stories for your audience." actions={<ActionButton onClick={() => { setError(''); setForm({ ...EMPTY, attachments: [], existingFiles: [] }); }}><Plus className="h-4 w-4" /> New post</ActionButton>} />

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!form} onClose={() => !saving && setForm(null)} eyebrow={form?._id ? 'Editing post' : 'New post'} title={form?._id ? 'Refine your story' : 'Start a new story'} description="Draft privately, then publish when it is ready.">
        {form && <form onSubmit={save}>
          <fieldset disabled={saving} className="space-y-6 border-0 p-0">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Post title" required><TextInput value={form.title} onChange={set('title')} required autoFocus /></Field>
              <Field label="Slug" hint="Leave blank to generate it from the title."><TextInput value={form.slug} onChange={set('slug')} placeholder="auto from title" /></Field>
              <Field label="Content type"><Select value={form.type} onChange={set('type')} options={[{ value: 'article', label: 'Article' }, { value: 'blog', label: 'Blog' }, { value: 'event', label: 'Event' }]} /></Field>
              <Field label="Publication status"><Select value={form.status} onChange={set('status')} options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} /></Field>
              <Field label="Tags" className="md:col-span-2" hint="Separate tags with commas."><TextInput value={form.tags} onChange={set('tags')} placeholder="AI, backend, tutorial" /></Field>
            </div>
            <div className="h-px bg-slate-200/70 dark:bg-slate-800/70" />
            <Field label="Excerpt" hint="A short introduction for cards and search results."><TextArea rows={3} value={form.excerpt} onChange={set('excerpt')} /></Field>
            <Field label="Content" hint="Markdown is supported."><TextArea rows={14} value={form.content} onChange={set('content')} required className="font-mono text-sm leading-7" /></Field>
            <AttachmentField label="Post attachments" hint="Upload images or supporting files here. They will be linked automatically after the post is created." files={form.attachments} existingFiles={form.existingFiles} onChange={(attachments) => setForm((value) => ({ ...value, attachments }))} onRemoveExisting={(file) => removeAttachment(file)} disabled={saving || !!removingFileId} />
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setForm(null)}>Cancel</ActionButton><ActionButton type="submit" loading={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create post'}</ActionButton></div>
          </fieldset>
        </form>}
      </Modal>

      <AdminPanel className="overflow-hidden">
        <AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">All posts <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Search, filter, and manage your writing.</p></div><div className="flex flex-col gap-2 sm:flex-row"><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…" className="w-full sm:w-56" /><Select value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'All statuses' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Drafts' }]} className="w-full sm:w-36" /></div></AdminToolbar>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">Post</th><th className="hidden px-4 py-3 md:table-cell">Slug</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <LoadingRows rows={5} /> : filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"><FileText className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate font-bold text-slate-800 dark:text-slate-200">{item.title || 'Untitled post'}</p><p className="truncate text-xs text-slate-400 md:hidden">{item.slug || 'No slug'}</p></div></div></td><td className="hidden max-w-48 truncate px-4 py-4 text-slate-500 md:table-cell">{item.slug || '—'}</td><td className="px-4 py-4"><Badge tone={TYPE_TONE[item.type] || 'slate'} dot>{item.type}</Badge></td><td className="px-4 py-4"><Badge tone={STATUS_TONE[item.status] || 'slate'} dot>{item.status}</Badge></td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-1"><ActionButton variant="subtle" aria-label={`Edit ${item.title}`} onClick={() => { setError(''); setForm(toForm(item)); }}><Pencil className="h-4 w-4" /></ActionButton><ActionButton variant="subtle" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton></div></td></tr>)}{!loading && filteredItems.length === 0 && <TableEmpty colSpan={5} icon={FileText} title={search || status ? 'No matching posts' : 'No posts yet'} description={search || status ? 'Try another search or filter.' : 'Create your first post to get started.'} />}</tbody></table></div>
      </AdminPanel>
    </div>
  );
}
