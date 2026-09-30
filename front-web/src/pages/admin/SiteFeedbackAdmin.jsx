import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, MessageSquareHeart, Reply, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { feedbackApi } from '../../api/feedback.js';
import { reactionsApi } from '../../api/reactions.js';
import { systemApi } from '../../api/system.js';
import ViewEngagement from '../../components/admin/ViewEngagement.jsx';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, Badge, LoadingRows, Modal, SearchInput, TableEmpty } from '../../components/admin/form.jsx';
import { refLabel } from '../../components/admin/view-utils.js';

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

// Every comment and reply lives under parentEntity 'feedback', so this view is
// the one place to read the whole discussion across all parent entities.
export default function SiteFeedbackAdmin() {
  const { can } = useAuth();
  const [systemId, setSystemId] = useState(null);
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  const canDelete = can('users', 'DELETE');

  const load = useCallback(async () => {
    try {
      const { system } = await systemApi.get();
      setSystemId(system?._id || null);
    } catch {
      setError('Unable to load the site feedback thread.');
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  // The cross-entity list needs every comment id, so it hits the staff-only
  // endpoint that spans all parent entities rather than a single parent.
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const result = await feedbackApi.listAll({ limit: 200 });
      const list = result.items || [];
      setItems(list);
      if (list.length > 0) {
        const batch = await reactionsApi.counts('feedback', list.map((item) => item._id));
        setCounts(batch.summaries || {});
      } else {
        setCounts({});
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load comments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadAll, 0);
    return () => window.clearTimeout(timer);
  }, [loadAll]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const author = String(refLabel(item.user) || 'guest').toLowerCase();
      return item.content?.toLowerCase().includes(query) || author.includes(query);
    });
  }, [items, search]);

  async function remove(item) {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await feedbackApi.remove(item._id);
      await loadAll();
      setViewing(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete comment.');
    }
  }

  return (
    <div className="space-y-7">
      <AdminHeader
        eyebrow="Community / Discussion"
        title="Site Feedback"
        description="The site-wide thread plus every comment and reply recorded across about, projects, blogs, plans and the feedback page."
        actions={systemId ? <Badge tone="indigo" dot>system</Badge> : null}
      />

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      {systemId && (
        <ViewEngagement parentEntity="system" parentId={systemId} />
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} eyebrow="Comment details" title="Comment" description="Full comment record including its parent and reactions.">
        {viewing && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/50">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{viewing.content}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <Badge tone="slate">{viewing.type}</Badge>
              <Badge tone="slate">on {viewing.parentEntity}</Badge>
              {viewing.parentId && <span className="font-mono text-[10px]">{viewing.parentId}</span>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="text-xs text-slate-400">
                <p className="font-bold text-slate-600 dark:text-slate-200">{refLabel(viewing.user) || 'Guest'}</p>
                <p>Author</p>
              </div>
              <div className="text-xs text-slate-400">
                <p className="font-bold text-slate-600 dark:text-slate-200">{formatDate(viewing.createdAt)}</p>
                <p>Created</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70">
              {canDelete && <ActionButton variant="danger" onClick={() => remove(viewing)}><Trash2 className="h-4 w-4" /> Delete</ActionButton>}
              <ActionButton variant="neutral" onClick={() => setViewing(null)}>Close</ActionButton>
            </div>
          </div>
        )}
      </Modal>

      <AdminPanel className="overflow-hidden">
        <AdminToolbar>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">All comments <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2>
            <p className="mt-1 text-xs text-slate-400">Comments and replies from every parent entity, newest first.</p>
          </div>
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search content or author…" className="w-full sm:w-64" />
        </AdminToolbar>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40">
              <tr>
                <th className="px-4 py-3">Content</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Reactions</th>
                <th className="hidden px-4 py-3 lg:table-cell">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <LoadingRows rows={5} /> : filteredItems.map((item) => {
                const summary = counts[item._id] || { like: 0, dislike: 0, love: 0, total: 0 };
                return (
                  <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        {item.type === 'reply' && <Reply className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />}
                        <p className="line-clamp-2 max-w-md text-slate-700 dark:text-slate-200">{item.content}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{refLabel(item.user) || 'Guest'}</td>
                    <td className="px-4 py-4"><Badge tone="slate">{item.parentEntity}</Badge></td>
                    <td className="px-4 py-4 text-xs text-slate-500">{summary.total}</td>
                    <td className="hidden px-4 py-4 text-xs text-slate-500 lg:table-cell">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <ActionButton variant="subtle" aria-label="View comment" onClick={() => setViewing(item)}><Eye className="h-4 w-4" /></ActionButton>
                        {canDelete && <ActionButton variant="subtle" aria-label="Delete comment" onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredItems.length === 0 && (
                <TableEmpty colSpan={6} icon={MessageSquareHeart} title={search ? 'No matching comments' : 'No comments yet'} description={search ? 'Try a different search term.' : 'Comments left on the public site will appear here.'} />
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
