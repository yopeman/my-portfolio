import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, FileImage, FolderOpen, Info, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { filesApi } from '../../api/files.js';
import { resolveFileUrl } from '../../services/adapters.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, EmptyState, Modal, SearchInput, ViewField, ViewSection, ViewTimestamps } from '../../components/admin/form.jsx';
import { formatBytesValue } from '../../components/admin/view-utils.js';

const PARENT_LABELS = { project: 'Project', blog: 'Post', plan: 'Plan', about: 'Profile', user: 'User' };
const PARENT_RESOURCES = { project: 'projects', blog: 'blogs', plan: 'plans', about: 'about', user: 'users' };

function formatSize(size) {
  if (!Number.isFinite(Number(size))) return '—';
  const bytes = Number(size);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uploader(item) {
  const user = item.uploadedBy;
  if (!user) return 'Unknown';
  if (typeof user === 'string') return 'Unknown';
  return user.name || user.email || 'Unknown';
}

function parentLabel(parentEntity) {
  if (parentEntity === 'about') return 'Profile asset';
  return PARENT_LABELS[parentEntity] || 'Attachment';
}

export default function FilesAdmin() {
  const { can } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await filesApi.list({ limit: 100 });
      setItems(result.items || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load files.');
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
    return query ? items.filter((item) => `${item.name || ''} ${item.title || ''} ${item.alt || ''} ${item.mimeType || ''} ${uploader(item)} ${item.parentEntity || ''}`.toLowerCase().includes(query)) : items;
  }, [items, search]);

  async function remove(item) {
    if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return;
    setError('');
    try {
      await filesApi.remove(item._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete file.');
    }
  }

  const isImage = (mime) => (mime || '').startsWith('image/');
  const canDelete = (item) => can(PARENT_RESOURCES[item.parentEntity] || '', 'DELETE');

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Content / Media" title="Files" description="Review the assets attached to your projects, posts, plans, and profile." actions={<div className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-300">{items.length} assets</div>} />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
      <AdminPanel className="flex items-start gap-3 border-indigo-100/80 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300"><Info className="h-4 w-4" /></div><div><p className="text-sm font-bold text-indigo-950 dark:text-indigo-100">Files are managed from their parent content</p><p className="mt-1 text-xs leading-relaxed text-indigo-700/70 dark:text-indigo-200/70">Open a project, post, plan, or About form to upload and remove attachments. The parent record is linked automatically, so no IDs are needed.</p></div></AdminPanel>
      <Modal open={!!viewing} onClose={() => setViewing(null)} eyebrow="File details" title={viewing?.title || viewing?.name || 'File'} description="Complete file record including its parent entity and uploader.">
        {viewing && <div className="space-y-5">
          <ViewSection title="File" count={viewing.mimeType}>
            {(viewing.mimeType || '').startsWith('image/') && <img src={resolveFileUrl(viewing.fileUrl || viewing.path)} alt={viewing.alt || viewing.name} className="mb-4 max-h-64 rounded-xl border border-slate-200 object-contain dark:border-slate-700" />}
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ViewField label="Name" value={viewing.name} />
              <ViewField label="Title" value={viewing.title} />
              <ViewField label="Alt text" value={viewing.alt} />
              <ViewField label="Order" value={viewing.order} />
              <ViewField label="Size" value={formatBytesValue(viewing.size)} />
              <ViewField label="MIME type" value={viewing.mimeType} />
              <ViewField label="Path" value={viewing.path} mono />
              <ViewField label="File ID" value={viewing._id} />
            </dl>
          </ViewSection>
          <ViewSection title="Parent entity" description="The record this asset belongs to.">
            <dl className="grid gap-4 sm:grid-cols-3">
              <ViewField label="Parent type" value={parentLabel(viewing.parentEntity)} />
              <ViewField label="Parent entity" value={viewing.parentEntity} />
              <ViewField label="Parent ID" value={viewing.parentId} />
            </dl>
          </ViewSection>
          <ViewSection title="Uploaded by">
            <dl className="grid gap-4 sm:grid-cols-3">
              <ViewField label="Name" value={typeof viewing.uploadedBy === 'object' ? viewing.uploadedBy?.name : undefined} />
              <ViewField label="Email" value={typeof viewing.uploadedBy === 'object' ? viewing.uploadedBy?.email : undefined} />
              <ViewField label="Uploader ID" value={typeof viewing.uploadedBy === 'object' ? viewing.uploadedBy?._id : viewing.uploadedBy} />
            </dl>
          </ViewSection>
          <ViewSection title="Record metadata">
            <ViewTimestamps createdAt={viewing.createdAt} updatedAt={viewing.updatedAt} deletedAt={viewing.deletedAt} />
          </ViewSection>
          <div className="flex justify-end border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setViewing(null)}>Close</ActionButton></div>
        </div>}
      </Modal>

      <AdminPanel className="overflow-hidden"><AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Asset library <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Preview, find, and remove uploaded files.</p></div><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files…" className="w-full sm:w-64" /></AdminToolbar>{loading ? <div className="space-y-3 p-5"><div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /></div> : filteredItems.length === 0 ? <EmptyState icon={FolderOpen} title={search ? 'No matching files' : 'No files yet'} description={search ? 'Try another search term.' : 'Upload your first asset from a parent content form.'} /> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">Preview</th><th className="px-4 py-3">File</th><th className="hidden px-4 py-3 lg:table-cell">Alt text</th><th className="hidden px-4 py-3 sm:table-cell">Parent</th><th className="hidden px-4 py-3 md:table-cell">Type &amp; size</th><th className="hidden px-4 py-3 xl:table-cell">Uploaded by</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-3">{isImage(item.mimeType) ? <img src={resolveFileUrl(item.fileUrl || item.path)} alt={item.alt || item.name} className="h-11 w-16 rounded-xl border border-slate-200 object-cover dark:border-slate-700" /> : <div className="flex h-11 w-16 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold uppercase text-slate-400 dark:bg-slate-800"><FileImage className="h-4 w-4" /></div>}</td><td className="px-4 py-3"><p className="max-w-56 truncate font-bold text-slate-700 dark:text-slate-200" title={item.name || ''}>{item.name || 'Attachment'}</p>{item.title && <p className="mt-0.5 max-w-56 truncate text-xs text-slate-500 dark:text-slate-400" title={item.title}>{item.title}</p>}</td><td className="hidden px-4 py-3 lg:table-cell"><p className="max-w-48 truncate text-xs text-slate-500 dark:text-slate-400" title={item.alt || ''}>{item.alt || <span className="text-slate-300 dark:text-slate-600">No alt</span>}</p></td><td className="hidden px-4 py-3 sm:table-cell"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{parentLabel(item.parentEntity)}</span></td><td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell"><p className="font-semibold text-slate-600 dark:text-slate-300">{item.mimeType || 'Unknown type'}</p><p className="mt-0.5 text-[11px] text-slate-400">{formatSize(item.size)}</p></td><td className="hidden px-4 py-3 xl:table-cell"><p className="max-w-40 truncate text-xs font-semibold text-slate-600 dark:text-slate-300" title={uploader(item)}>{uploader(item)}</p>{item.createdAt && <p className="mt-0.5 text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><ActionButton variant="subtle" aria-label={`View ${item.name || 'file'}`} onClick={() => setViewing(item)}><Eye className="h-4 w-4" /></ActionButton>{canDelete(item) && <ActionButton variant="subtle" aria-label={`Delete ${item.name || 'file'}`} onClick={() => remove(item)}><Trash2 className="h-3.5 w-3.5" /></ActionButton>}</div></td></tr>)}</tbody></table></div>}</AdminPanel>
    </div>
  );
}
