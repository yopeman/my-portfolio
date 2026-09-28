import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { filesApi } from '../../api/files.js';
import { blogsApi } from '../../api/blogs.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, AttachmentField, Badge, Field, LoadingRows, Modal, SearchInput, Select, TableEmpty, TextArea, TextInput, ViewField, ViewFiles, ViewList, ViewSection, ViewTags, ViewTimestamps } from '../../components/admin/form.jsx';
import ViewEngagement from '../../components/admin/ViewEngagement.jsx';

const linkDefaults = { type: '', link: '' };
const TYPE_TONE = { article: 'indigo', blog: 'green', event: 'amber' };
const STATUS_TONE = { published: 'green', draft: 'amber', archived: 'slate' };

function emptyBlog() {
  return { title: '', slug: '', type: 'article', status: 'draft', excerpt: '', content: '', tags: '', author: '', readingTime: 0, publishedAt: null, links: [{ ...linkDefaults }], attachments: [], attachmentMetadata: [], existingFiles: [], originalFiles: [] };
}

function repeaterItems(items) {
  if (!Array.isArray(items) || items.length === 0) return [{ ...linkDefaults }];
  return items.map((item) => ({ ...linkDefaults, ...(item || {}) }));
}

function toForm(item) {
  const existingFiles = (item.files || []).map((file) => ({ ...file }));
  return {
    ...emptyBlog(),
    ...item,
    tags: (item.tags || []).join(', '),
    links: repeaterItems(item.links),
    attachments: [],
    attachmentMetadata: [],
    existingFiles,
    originalFiles: existingFiles.map((file) => ({ ...file })),
  };
}

function cleanLinks(links) {
  return (links || []).filter((link) => link.link?.trim()).map((link) => ({ type: link.type?.trim().toLowerCase() || 'website', link: link.link.trim() }));
}

function readingTimeLabel(item) {
  const words = String(item.content || '').trim().split(/\s+/).filter(Boolean).length;
  return `${item.readingTime || Math.max(1, Math.round(words / 200))} min`;
}

function authorLabel(author) {
  if (!author) return 'Assigned automatically';
  if (typeof author === 'object') return author.name || author.email || author._id || 'Assigned author';
  return author;
}

function publishedAtLabel(value) {
  if (!value) return 'Set when published';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Set when published' : date.toLocaleString();
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

export default function BlogsAdmin() {
  const { can } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingFileId, setRemovingFileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await blogsApi.list({ limit: 100, ...(status ? { status } : {}) });
      setItems(result.items || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load posts.');
    } finally {
      setLoading(false);
    }
  }, [status]);

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

  const updateLink = (index, key, value) => setForm((current) => ({ ...current, links: current.links.map((link, linkIndex) => linkIndex === index ? { ...link, [key]: value } : link) }));
  const addLink = () => setForm((current) => ({ ...current, links: [...current.links, { ...linkDefaults }] }));
  const removeLink = (index) => setForm((current) => ({ ...current, links: current.links.filter((_, linkIndex) => linkIndex !== index) }));

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
    const { attachments, attachmentMetadata, existingFiles, originalFiles, ...payload } = form;
    delete payload._id;
    delete payload.files;
    payload.tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    payload.links = cleanLinks(form.links);
    try {
      const result = form._id ? await blogsApi.update(form._id, payload) : await blogsApi.create(payload);
      const blog = result.blog;
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
          await filesApi.uploadMany('blog', blog._id, attachments, undefined, attachmentMetadata);
        }
      } catch (uploadError) {
        const completedFiles = new Set(uploadError.completedFiles || []);
        setForm((value) => ({
          ...value,
          _id: blog._id,
          attachments: value.attachments.filter((file) => !completedFiles.has(file)),
          attachmentMetadata: value.attachmentMetadata.filter((_, index) => !completedFiles.has(value.attachments[index])),
        }));
        setError('Post saved, but one or more attachment changes could not be saved. Try again.');
        return;
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
      <AdminHeader eyebrow="Content / Writing" title="Blogs" description="Shape your ideas into clear, useful stories for your audience." actions={can('blogs', 'CREATE') ? <ActionButton onClick={() => { setError(''); setForm(emptyBlog()); }}><Plus className="h-4 w-4" /> New post</ActionButton> : null} />

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!viewing} onClose={() => setViewing(null)} eyebrow="Post details" title={viewing?.title || 'Post'} description="Complete record with author, links, and attached files.">
        {viewing && <div className="space-y-5">
          <ViewSection title="Overview" count={viewing.status}>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ViewField label="Slug" value={viewing.slug} />
              <ViewField label="Content type" value={viewing.type} />
              <ViewField label="Author" value={authorLabel(viewing.author)} />
              <ViewField label="Reading time" value={readingTimeLabel(viewing)} />
              <ViewField label="Published at" value={publishedAtLabel(viewing.publishedAt)} />
              <ViewField label="Author ID" value={typeof viewing.author === 'string' ? viewing.author : viewing.author?._id} />
            </dl>
            <div className="mt-4"><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Tags</p><ViewTags items={viewing.tags || []} empty="No tags" /></div>
          </ViewSection>
          <ViewSection title="Content">
            <dl className="grid gap-4"><ViewField label="Excerpt" value={viewing.excerpt} /><ViewField label="Body" value={viewing.content} mono /></dl>
          </ViewSection>
          <ViewSection title="Links" count={(viewing.links || []).length}>
            <ViewList items={viewing.links || []} empty="No links recorded.">
              {(link) => <div className="flex flex-wrap items-center gap-2"><Badge tone="indigo">{link.type || 'link'}</Badge><a href={link.link} target="_blank" rel="noopener noreferrer" className="truncate text-sm font-semibold text-indigo-600 hover:underline dark:text-violet-300">{link.link || '—'}</a></div>}
            </ViewList>
          </ViewSection>
          <ViewSection title="Files" description="Assets linked to this post." count={(viewing.files || []).length}>
            <ViewFiles files={viewing.files || []} parentEntity="blog" />
          </ViewSection>
          <ViewEngagement parentEntity="blog" parentId={viewing._id} className="space-y-4" />
          <ViewSection title="Record metadata">
            <ViewTimestamps createdAt={viewing.createdAt} updatedAt={viewing.updatedAt} deletedAt={viewing.deletedAt} extra={[["ID", viewing._id]]} />
          </ViewSection>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setViewing(null)}>Close</ActionButton>{can('blogs', 'UPDATE') && <ActionButton type="button" onClick={() => { setError(''); setForm(toForm(viewing)); setViewing(null); }}><Pencil className="h-4 w-4" /> Edit post</ActionButton>}</div>
        </div>}
      </Modal>

      <Modal open={!!form} onClose={() => !saving && setForm(null)} eyebrow={form?._id ? 'Editing post' : 'New post'} title={form?._id ? 'Refine your story' : 'Start a new story'} description="Draft privately, then publish when it is ready.">
        {form && <form onSubmit={save}>
          <fieldset disabled={saving} className="space-y-6 border-0 p-0">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Post title" required><TextInput value={form.title} onChange={set('title')} required autoFocus /></Field>
              <Field label="Slug" hint="Leave blank to generate it from the title."><TextInput value={form.slug} onChange={set('slug')} placeholder="auto from title" /></Field>
              <Field label="Content type"><Select value={form.type} onChange={set('type')} options={[{ value: 'event', label: 'Event' }, { value: 'article', label: 'Article' }, { value: 'blog', label: 'Blog' }]} /></Field>
              <Field label="Publication status"><Select value={form.status} onChange={set('status')} options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }]} /></Field>
              <Field label="Tags" className="md:col-span-2" hint="Separate tags with commas."><TextInput value={form.tags} onChange={set('tags')} placeholder="AI, backend, tutorial" /></Field>
            </div>
            <div className="h-px bg-slate-200/70 dark:bg-slate-800/70" />
            <Field label="Excerpt" hint="A short introduction for cards and search results."><TextArea rows={3} value={form.excerpt} onChange={set('excerpt')} /></Field>
            <Field label="Content" hint="Markdown is supported."><TextArea rows={14} value={form.content} onChange={set('content')} required className="font-mono text-sm leading-7" /></Field>
            <RepeaterField title="Links" description="Add related website, documentation, or social links." items={form.links} onAdd={addLink} onRemove={removeLink}>
              {(item, index) => <div className="grid gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]"><Field label="Type"><TextInput value={item.type} onChange={(event) => updateLink(index, 'type', event.target.value)} placeholder="website" /></Field><Field label="Link"><TextInput type="url" value={item.link} onChange={(event) => updateLink(index, 'link', event.target.value)} placeholder="https://…" /></Field></div>}
            </RepeaterField>
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Author" hint="Assigned to the authenticated account when created."><TextInput disabled value={authorLabel(form.author)} /></Field>
              <Field label="Reading time" hint="Calculated from content automatically."><TextInput disabled value={readingTimeLabel(form)} /></Field>
              <Field label="Published at" hint="Set automatically when first published."><TextInput disabled value={publishedAtLabel(form.publishedAt)} /></Field>
            </div>
             <div className="grid gap-5 md:grid-cols-3">
               <Field label="Created at"><TextInput disabled value={formatDate(form.createdAt)} /></Field>
               <Field label="Updated at"><TextInput disabled value={formatDate(form.updatedAt)} /></Field>
               <Field label="Deleted at"><TextInput disabled value={formatDate(form.deletedAt)} /></Field>
             </div>
             <AttachmentField label="Post files" hint="Upload images or supporting files. Set title, alt text, and order for each file." files={form.attachments} existingFiles={form.existingFiles} metadata={form.attachmentMetadata} onChange={(attachments) => setForm((value) => ({ ...value, attachments }))} onMetadataChange={(attachmentMetadata) => setForm((value) => ({ ...value, attachmentMetadata }))} onExistingChange={(existingFiles) => setForm((value) => ({ ...value, existingFiles }))} onRemoveExisting={can('blogs', 'DELETE') ? removeAttachment : undefined} showMetadata disabled={saving || !!removingFileId || !can('blogs', 'UPDATE')} />

            <p className="text-[10px] leading-relaxed text-slate-400">Created, updated, deleted, and file timestamp fields are generated automatically by the backend.</p>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setForm(null)}>Cancel</ActionButton><ActionButton type="submit" loading={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create post'}</ActionButton></div>
          </fieldset>
        </form>}
      </Modal>

      <AdminPanel className="overflow-hidden">
        <AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">All posts <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Search, filter, and manage your writing.</p></div><div className="flex flex-col gap-2 sm:flex-row"><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…" className="w-full sm:w-56" /><Select value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'All statuses' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Drafts' }, { value: 'archived', label: 'Archived' }]} className="w-full sm:w-36" /></div></AdminToolbar>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">Post</th><th className="hidden px-4 py-3 md:table-cell">Slug</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <LoadingRows rows={5} /> : filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"><FileText className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate font-bold text-slate-800 dark:text-slate-200">{item.title || 'Untitled post'}</p><p className="truncate text-xs text-slate-400 md:hidden">{item.slug || 'No slug'}</p></div></div></td><td className="hidden max-w-48 truncate px-4 py-4 text-slate-500 md:table-cell">{item.slug || '—'}</td><td className="px-4 py-4"><Badge tone={TYPE_TONE[item.type] || 'slate'} dot>{item.type}</Badge></td><td className="px-4 py-4"><Badge tone={STATUS_TONE[item.status] || 'slate'} dot>{item.status}</Badge></td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-1"><ActionButton variant="subtle" aria-label={`View ${item.title}`} onClick={() => setViewing(item)}><Eye className="h-4 w-4" /></ActionButton>{can('blogs', 'UPDATE') && <ActionButton variant="subtle" aria-label={`Edit ${item.title}`} onClick={() => { setError(''); setForm(toForm(item)); }}><Pencil className="h-4 w-4" /></ActionButton>}{can('blogs', 'DELETE') && <ActionButton variant="subtle" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton>}</div></td></tr>)}{!loading && filteredItems.length === 0 && <TableEmpty colSpan={5} icon={FileText} title={search || status ? 'No matching posts' : 'No posts yet'} description={search || status ? 'Try another search or filter.' : 'Create your first post to get started.'} />}</tbody></table></div>
      </AdminPanel>
    </div>
  );
}
