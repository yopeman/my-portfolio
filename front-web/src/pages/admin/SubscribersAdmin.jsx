import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { subscribersApi } from '../../api/subscribers.js';
import { Badge, ActionButton } from '../../components/admin/form.jsx';

export default function SubscribersAdmin() {
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    subscribersApi.list({ limit: 100 }).then((r) => setItems(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(item) {
    await subscribersApi.remove(item._id);
    load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Subscribers</h1>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 hidden sm:table-cell">Subscribed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.email}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={item.unsubscribedAt ? 'rose' : 'green'}>
                    {item.unsubscribedAt ? 'unsubscribed' : 'active'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <ActionButton variant="subtle" onClick={() => remove(item)}>
                    <Trash2 className="w-4 h-4" />
                  </ActionButton>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No subscribers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}