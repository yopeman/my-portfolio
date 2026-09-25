import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usersApi } from '../../api/users.js';
import { Badge, Field, Select } from '../../components/admin/form.jsx';

const ROLE_TONE = { owner: 'indigo', admin: 'amber', member: 'green', user: 'slate' };
const ROLES = ['user', 'member', 'admin', 'owner'];

export default function UsersAdmin() {
  const { user: me, can } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    usersApi.list({ limit: 100, ...(search ? { search } : {}) }).then((r) => setItems(r.items)).catch(() => {});
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  async function changeRole(item, role) {
    await usersApi.update(item._id, { role });
    load();
  }

  async function remove(item) {
    await usersApi.remove(item._id);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Users</h1>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 hidden sm:table-cell">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                  {item.name}
                  {item._id === me?._id && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{item.email}</td>
                <td className="px-4 py-3">
                  {can('users', 'UPDATE') && item.role !== 'owner' ? (
                    <Field label="">
                      <Select value={item.role} onChange={(e) => changeRole(item, e.target.value)} options={ROLES} />
                    </Field>
                  ) : (
                    <Badge tone={ROLE_TONE[item.role] || 'slate'}>{item.role}</Badge>
                  )}
                  {item.role === 'owner' && <Badge tone="indigo">owner</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  {can('users', 'DELETE') && item._id !== me?._id && (
                    <button
                      onClick={() => remove(item)}
                      aria-label="Delete user"
                      className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}