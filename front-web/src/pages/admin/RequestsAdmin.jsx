import { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { requestsApi } from '../../api/requests.js';
import { Badge, Field, Select, ActionButton } from '../../components/admin/form.jsx';

const STATUSES = ['pending', 'replied', 'assigned', 'completed', 'cancelled'];
const STATUS_TONE = {
  pending: 'amber', replied: 'indigo', assigned: 'slate', completed: 'green', cancelled: 'rose',
};

export default function RequestsAdmin() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(() => {
    requestsApi
      .listAll({ limit: 100, ...(statusFilter ? { status: statusFilter } : {}) })
      .then((r) => setItems(r.items))
      .catch(() => {});
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(item) {
    await requestsApi.update(item._id, { isRead: !item.isRead });
    load();
  }

  async function setStatus(item, status) {
    await requestsApi.update(item._id, { status });
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Requests</h1>
        <div className="flex items-center gap-2">
          <Field label="">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={['', ...STATUSES]} />
          </Field>
          <ActionButton variant="neutral" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</ActionButton>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {items.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-400">No requests found.</p>}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => (
            <div key={item._id} className="px-5 py-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.isRead ? <Badge tone="green">read</Badge> : <Badge tone="amber">new</Badge>}
                  <Badge tone={STATUS_TONE[item.status] || 'slate'}>{item.status}</Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ActionButton variant="neutral" onClick={() => markRead(item)}>
                    <Check className="w-3.5 h-3.5" /> {item.isRead ? 'Unread' : 'Read'}
                  </ActionButton>
                  <Field label="">
                    <Select value={item.status} onChange={(e) => setStatus(item, e.target.value)} options={STATUSES} />
                  </Field>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">{item.message}</p>
              {(item.requirements || item.minBudget != null || item.maxBudget != null) && (
                <p className="text-xs text-slate-400">
                  {item.requirements && <span className="mr-3">Req: {item.requirements}</span>}
                  {item.minBudget != null && item.maxBudget != null && (
                    <span>Budget: ${item.minBudget}–${item.maxBudget}</span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}