import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Mail, Trash2 } from 'lucide-react';
import { subscribersApi } from '../../api/subscribers.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, Badge, EmptyState, Modal, SearchInput, ViewField, ViewSection, ViewTimestamps } from '../../components/admin/form.jsx';

export default function SubscribersAdmin() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await subscribersApi.list({ limit: 100 });
      setItems(result.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load subscribers.');
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
      const matchesQuery = !query || item.email.toLowerCase().includes(query);
      const active = !item.unsubscribedAt;
      return matchesQuery && (!status || (status === 'active' ? active : !active));
    });
  }, [items, search, status]);

  async function remove(item) {
    if (!window.confirm(`Remove ${item.email} from your subscribers?`)) return;
    try {
      await subscribersApi.remove(item._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove subscriber.');
    }
  }

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Community / Audience" title="Subscribers" description="Keep your audience list organized and easy to maintain." actions={<div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300">{items.length} total</div>} />

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!viewing} onClose={() => setViewing(null)} eyebrow="Subscriber details" title={viewing?.email || 'Subscriber'} description="Complete subscriber record and its subscription timeline.">
        {viewing && <div className="space-y-5">
          <ViewSection title="Subscription" count={viewing.unsubscribedAt ? 'unsubscribed' : 'active'}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <ViewField label="Email" value={viewing.email} />
              <ViewField label="Status" value={viewing.unsubscribedAt ? 'Unsubscribed' : 'Active'} />
              <ViewField label="Unsubscribed at" value={viewing.unsubscribedAt} />
              <ViewField label="Subscriber ID" value={viewing._id} />
            </dl>
          </ViewSection>
          <ViewSection title="Record metadata">
            <ViewTimestamps createdAt={viewing.createdAt} updatedAt={viewing.updatedAt} deletedAt={viewing.deletedAt} />
          </ViewSection>
          <div className="flex justify-end border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setViewing(null)}>Close</ActionButton></div>
        </div>}
      </Modal>

      <AdminPanel className="overflow-hidden">
        <AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Subscriber directory <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Search by email or filter by subscription status.</p></div><div className="flex flex-col gap-2 sm:flex-row"><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email…" className="w-full sm:w-56" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"><option value="">All statuses</option><option value="active">Active</option><option value="unsubscribed">Unsubscribed</option></select></div></AdminToolbar>
        {loading ? <div className="space-y-3 p-5">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div> : filteredItems.length === 0 ? <EmptyState icon={Mail} title={search || status ? 'No matching subscribers' : 'No subscribers yet'} description={search || status ? 'Try another search or status filter.' : 'New subscribers will appear here automatically.'} /> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">Email</th><th className="hidden px-4 py-3 sm:table-cell">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-200">{item.email}</td><td className="hidden px-4 py-4 text-slate-500 sm:table-cell">{new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td><td className="px-4 py-4"><Badge tone={item.unsubscribedAt ? 'rose' : 'green'} dot>{item.unsubscribedAt ? 'unsubscribed' : 'active'}</Badge></td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-1"><ActionButton variant="subtle" aria-label={`View ${item.email}`} onClick={() => setViewing(item)}><Eye className="h-4 w-4" /></ActionButton><ActionButton variant="subtle" aria-label={`Remove ${item.email}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton></div></td></tr>)}</tbody></table></div>}
      </AdminPanel>
    </div>
  );
}
