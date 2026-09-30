import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Eye, Inbox, RefreshCw } from 'lucide-react';
import { requestsApi } from '../../api/requests.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, Badge, EmptyState, Modal, SearchInput, Select, ViewField, ViewList, ViewSection, ViewTimestamps } from '../../components/admin/form.jsx';
import { formatDateValue, refLabel } from '../../components/admin/view-utils.js';

const STATUSES = ['pending', 'replied', 'assigned', 'completed', 'cancelled'];
const STATUS_TONE = { pending: 'amber', replied: 'indigo', assigned: 'slate', completed: 'green', cancelled: 'rose' };

export default function RequestsAdmin() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await requestsApi.listAll({ limit: 100, ...(statusFilter ? { status: statusFilter } : {}) });
      setItems(result.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => `${item.message} ${item.requirements || ''}`.toLowerCase().includes(query));
  }, [items, search]);

  async function update(item, payload) {
    setUpdatingId(item._id);
    setError('');
    try {
      await requestsApi.update(item._id, payload);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update request.');
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Community / Inbox" title="Requests" description="Triage new conversations, keep context visible, and move work forward." actions={<ActionButton variant="neutral" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</ActionButton>} />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!viewing} onClose={() => setViewing(null)} eyebrow="Request details" title="Full request record" description="Everything captured for this request, including the related user, project, and assignee.">
        {viewing && <div className="space-y-5">
          <ViewSection title="Overview" count={viewing.status}>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ViewField label="Status" value={viewing.status} />
              <ViewField label="Read" value={viewing.isRead ? 'Read' : 'Unread'} />
              <ViewField label="Read at" value={formatDateValue(viewing.readAt)} />
              <ViewField label="Replied at" value={formatDateValue(viewing.repliedAt)} />
              <ViewField label="Min budget" value={viewing.minBudget ?? null} />
              <ViewField label="Max budget" value={viewing.maxBudget ?? null} />
            </dl>
          </ViewSection>
          <ViewSection title="Message">
            <ViewField label="Message" value={viewing.message} />
            <div className="mt-4"><ViewField label="Requirements" value={viewing.requirements} /></div>
          </ViewSection>
          <ViewSection title="Requester" description="User who submitted this request.">
            {viewing.user
              ? <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><ViewField label="Name" value={refLabel(viewing.user)} /><ViewField label="Email" value={viewing.user.email} /><ViewField label="Phone" value={viewing.user.phone} /><ViewField label="Role" value={viewing.user.role} /><ViewField label="User ID" value={viewing.user._id} /><ViewField label="Bio" value={viewing.user.bio} /></dl>
              : <p className="text-xs text-slate-400">No linked user on this request.</p>}
          </ViewSection>
          <ViewSection title="Attached project" description="Project this request refers to.">
            {viewing.project
              ? <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><ViewField label="Name" value={refLabel(viewing.project)} /><ViewField label="Slug" value={viewing.project.slug} /><ViewField label="Type" value={viewing.project.type} /><ViewField label="Project ID" value={viewing.project._id} /><div className="sm:col-span-2 lg:col-span-3"><ViewField label="Summary" value={viewing.project.summary} /></div></dl>
              : <p className="text-xs text-slate-400">No project attached.</p>}
          </ViewSection>
          <ViewSection title="Assigned to">
            {viewing.assignedTo
              ? <dl className="grid gap-4 sm:grid-cols-3"><ViewField label="Name" value={refLabel(viewing.assignedTo)} /><ViewField label="Email" value={viewing.assignedTo.email} /><ViewField label="Role" value={viewing.assignedTo.role} /></dl>
              : <p className="text-xs text-slate-400">Not assigned to anyone.</p>}
          </ViewSection>
          <ViewSection title="Timeline" count={(viewing.timeline || []).length}>
            <ViewList items={viewing.timeline || []} empty="No timeline entries.">
              {(entry, index) => <div className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{index + 1}</span><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{typeof entry === 'string' ? entry : JSON.stringify(entry)}</p></div>}
            </ViewList>
          </ViewSection>
          <ViewSection title="Record metadata">
            <ViewTimestamps createdAt={viewing.createdAt} updatedAt={viewing.updatedAt} deletedAt={viewing.deletedAt} extra={[["ID", viewing._id]]} />
          </ViewSection>
          <div className="flex justify-end border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setViewing(null)}>Close</ActionButton></div>
        </div>}
      </Modal>
      <AdminPanel className="overflow-hidden">
        <AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Inbox <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Filter by workflow stage or search the message.</p></div><div className="flex flex-col gap-2 sm:flex-row"><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requests…" className="w-full sm:w-56" /><Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((status) => ({ value: status, label: status[0].toUpperCase() + status.slice(1) }))]} className="w-full sm:w-40" /></div></AdminToolbar>
        {loading ? <div className="space-y-3 p-5"><div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /></div> : filteredItems.length === 0 ? <EmptyState icon={Inbox} title="No requests found" description={search || statusFilter ? 'Try clearing a filter or changing your search.' : 'New contact requests will appear here as they arrive.'} /> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{filteredItems.map((item) => <article key={item._id} className="p-5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/20"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><Badge tone={item.isRead ? 'green' : 'amber'} dot>{item.isRead ? 'read' : 'new'}</Badge><Badge tone={STATUS_TONE[item.status] || 'slate'} dot>{item.status}</Badge><span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span></div><div className="flex items-center gap-2"><ActionButton variant="subtle" aria-label={`View request from ${refLabel(item.user) || 'visitor'}`} onClick={() => setViewing(item)}><Eye className="h-4 w-4" /></ActionButton><ActionButton variant="neutral" loading={updatingId === item._id} onClick={() => update(item, { isRead: !item.isRead })}><Check className="h-3.5 w-3.5" /> {item.isRead ? 'Mark unread' : 'Mark read'}</ActionButton><Select value={item.status} onChange={(e) => update(item, { status: e.target.value })} options={STATUSES} className="min-w-28" disabled={updatingId === item._id} /></div></div><p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">{item.message}</p>{(item.requirements || item.minBudget != null || item.maxBudget != null) && <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">{item.requirements && <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800/60">Requirements: {item.requirements}</span>}{item.minBudget != null && item.maxBudget != null && <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800/60">Budget: ${item.minBudget}–${item.maxBudget}</span>}</div>}</article>)}</div>}
      </AdminPanel>
    </div>
  );
}
