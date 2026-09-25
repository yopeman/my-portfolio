import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usersApi } from '../../api/users.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, Badge, Field, SearchInput, Select, TableEmpty } from '../../components/admin/form.jsx';

const ROLE_TONE = { owner: 'indigo', admin: 'amber', member: 'green', user: 'slate' };
const ROLES = ['user', 'member', 'admin', 'owner'];

export default function UsersAdmin() {
  const { user: me, can } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await usersApi.list({ limit: 100, ...(search ? { search } : {}) });
      setItems(result.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredItems = useMemo(() => roleFilter ? items.filter((item) => item.role === roleFilter) : items, [items, roleFilter]);

  async function changeRole(item, role) {
    try {
      await usersApi.update(item._id, { role });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update role.');
    }
  }

  async function remove(item) {
    if (!window.confirm(`Remove ${item.name} from users?`)) return;
    try {
      await usersApi.remove(item._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to remove user.');
    }
  }

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Workspace / Access" title="Users" description="Manage who can access the workspace and what they can do." actions={<div className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/40 dark:text-violet-300">{items.length} members</div>} />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
      <AdminPanel className="overflow-hidden">
        <AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Team directory <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Search by name or email, then adjust roles inline.</p></div><div className="flex flex-col gap-2 sm:flex-row"><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-full sm:w-56" /><Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} options={[{ value: '', label: 'All roles' }, ...ROLES.map((role) => ({ value: role, label: role[0].toUpperCase() + role.slice(1) }))]} className="w-full sm:w-36" /></div></AdminToolbar>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">User</th><th className="hidden px-4 py-3 sm:table-cell">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <tr><td colSpan={4} className="px-4 py-4"><div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /></td></tr> : filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-xs font-extrabold text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">{(item.name || '?').slice(0, 1).toUpperCase()}</div><div><p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>{item._id === me?._id && <p className="text-xs text-indigo-500">That’s you</p>}</div></div></td><td className="hidden px-4 py-4 text-slate-500 sm:table-cell">{item.email}</td><td className="px-4 py-4">{can('users', 'UPDATE') && item.role !== 'owner' ? <Field><Select value={item.role} onChange={(e) => changeRole(item, e.target.value)} options={ROLES} className="min-w-28" /></Field> : <div className="flex items-center gap-2"><Badge tone={ROLE_TONE[item.role] || 'slate'} dot>{item.role}</Badge>{item.role === 'owner' && <Badge tone="indigo">protected</Badge>}</div>}</td><td className="px-4 py-4 text-right">{can('users', 'DELETE') && item._id !== me?._id && <ActionButton variant="subtle" aria-label={`Remove ${item.name}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton>}</td></tr>)}{!loading && filteredItems.length === 0 && <TableEmpty colSpan={4} icon={UsersIcon} title="No users found" description={search || roleFilter ? 'Try a different search or role filter.' : 'No users are available yet.'} />}</tbody></table></div>
      </AdminPanel>
    </div>
  );
}
