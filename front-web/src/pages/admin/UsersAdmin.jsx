import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { filesApi } from '../../api/files.js';
import { usersApi } from '../../api/users.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, AttachmentField, Badge, Field, Modal, SearchInput, Select, TableEmpty, TextArea, TextInput, ViewField, ViewFiles, ViewSection, ViewTimestamps } from '../../components/admin/form.jsx';

const ROLE_TONE = { owner: 'indigo', admin: 'amber', member: 'green', user: 'slate' };
const ROLES = ['user', 'member', 'admin', 'owner'];
const PERMISSION_RESOURCES = ['users', 'about', 'projects', 'requests', 'subscribers', 'blogs', 'plans'];
const PERMISSION_ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE'];
const ROLE_PERMISSION_DEFAULTS = {
  owner: Object.fromEntries(PERMISSION_RESOURCES.map((resource) => [resource, PERMISSION_ACTIONS])),
  admin: Object.fromEntries(PERMISSION_RESOURCES.map((resource) => [resource, PERMISSION_ACTIONS])),
  member: {
    users: [],
    about: ['READ', 'UPDATE'],
    projects: ['READ', 'CREATE', 'UPDATE'],
    requests: ['READ', 'CREATE', 'UPDATE'],
    subscribers: ['READ'],
    blogs: ['READ', 'CREATE', 'UPDATE'],
    plans: ['READ', 'CREATE', 'UPDATE'],
  },
  user: Object.fromEntries(PERMISSION_RESOURCES.map((resource) => [resource, []])),
};

function permissionsForRole(role) {
  const defaults = ROLE_PERMISSION_DEFAULTS[role] || ROLE_PERMISSION_DEFAULTS.user;
  return Object.fromEntries(PERMISSION_RESOURCES.map((resource) => [resource, [...(defaults[resource] || [])]]));
}

function normalizePermissions(value) {
  const source = value && typeof value === 'object' ? value : {};
  return Object.fromEntries(PERMISSION_RESOURCES.map((resource) => {
    const actions = Array.isArray(source[resource]) ? source[resource] : [];
    return [resource, [...new Set(actions.filter((action) => PERMISSION_ACTIONS.includes(action)))].sort((a, b) => PERMISSION_ACTIONS.indexOf(a) - PERMISSION_ACTIONS.indexOf(b))];
  }));
}

function emptyUser() {
  return {
    name: '', phone: '', email: '', additionalContact: '', bio: '', password: '', role: 'user', source: 'credentials',
    permissions: permissionsForRole('user'), originalPermissions: permissionsForRole('user'), attachments: [], attachmentMetadata: [], existingFiles: [], originalFiles: [],
  };
}

function toForm(item) {
  const existingFiles = (item.files || []).map((file) => ({ ...file }));
  return {
    ...emptyUser(),
    ...item,
    password: '',
    permissions: normalizePermissions(item.permissions),
    originalPermissions: normalizePermissions(item.permissions),
    attachments: [],
    attachmentMetadata: [],
    existingFiles,
    originalFiles: existingFiles.map((file) => ({ ...file })),
  };
}

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleString();
}

function PermissionMatrix({ permissions, disabled, onToggle, onReset }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Permissions</h3><p className="mt-1 text-xs text-slate-400">Choose the actions this user can perform for each workspace resource.</p></div>{onReset && <ActionButton type="button" variant="neutral" onClick={onReset} disabled={disabled}>Reset to role defaults</ActionButton>}</div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/70 dark:border-slate-800/70">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-white/70 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-900/60"><tr><th className="px-4 py-3">Resource</th>{PERMISSION_ACTIONS.map((action) => <th key={action} className="px-3 py-3 text-center">{action}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {PERMISSION_RESOURCES.map((resource) => <tr key={resource}><td className="px-4 py-3 font-bold capitalize text-slate-700 dark:text-slate-200">{resource}</td>{PERMISSION_ACTIONS.map((action) => <td key={action} className="px-3 py-3 text-center"><input type="checkbox" checked={(permissions[resource] || []).includes(action)} onChange={(event) => onToggle(resource, action, event.target.checked)} disabled={disabled} aria-label={`${action} ${resource}`} className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800" /></td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UsersAdmin() {
  const { user: me, can } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingFileId, setRemovingFileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await usersApi.list({ limit: 100, ...(search ? { search } : {}), ...(roleFilter ? { role: roleFilter } : {}) });
      setItems(result.items || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredItems = useMemo(() => roleFilter ? items.filter((item) => item.role === roleFilter) : items, [items, roleFilter]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const setRole = (event) => {
    const role = event.target.value;
    setForm((current) => ({ ...current, role, permissions: permissionsForRole(role) }));
  };

  const togglePermission = (resource, action, checked) => setForm((current) => {
    const currentActions = current.permissions[resource] || [];
    const nextActions = checked ? [...new Set([...currentActions, action])] : currentActions.filter((item) => item !== action);
    return { ...current, permissions: { ...current.permissions, [resource]: nextActions } };
  });

  const resetPermissions = () => setForm((current) => ({ ...current, permissions: permissionsForRole(current.role) }));

  function openCreate() {
    setError('');
    setForm(emptyUser());
  }

  function openEdit(item) {
    setError('');
    setForm(toForm(item));
  }

  async function changeRole(item, role) {
    try {
      await usersApi.update(item._id, { role });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update role.');
    }
  }

  async function removeAttachment(file) {
    if (!window.confirm(`Remove “${file.name || 'this file'}” from the user?`)) return;
    setRemovingFileId(file._id);
    setError('');
    try {
      await filesApi.remove(file._id);
      setForm((value) => ({ ...value, existingFiles: value.existingFiles.filter((item) => item._id !== file._id) }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove file.');
    } finally {
      setRemovingFileId('');
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const { password, permissions: formPermissions, attachments, attachmentMetadata, existingFiles, originalFiles, originalPermissions, ...payload } = form;
    delete payload._id;
    delete payload.files;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.deletedAt;
    const permissions = normalizePermissions(formPermissions);
    if ((!form._id || JSON.stringify(permissions) !== JSON.stringify(normalizePermissions(originalPermissions))) && (form._id ? me?.role === 'owner' || me?.role === 'admin' : true)) payload.permissions = permissions;
    if (password) payload.password = password;
    try {
      const result = form._id ? await usersApi.update(form._id, payload) : await usersApi.create(payload);
      const user = result.user;
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
          await filesApi.uploadMany('user', user._id, attachments, undefined, attachmentMetadata);
        }
      } catch (uploadError) {
        const completedFiles = new Set(uploadError.completedFiles || []);
        setForm((value) => ({
          ...value,
          _id: user._id,
          attachments: value.attachments.filter((file) => !completedFiles.has(file)),
          attachmentMetadata: value.attachmentMetadata.filter((_, index) => !completedFiles.has(value.attachments[index])),
        }));
        setError('User saved, but one or more file changes could not be saved. Try again.');
        return;
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user.');
    } finally {
      setSaving(false);
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

  const isSelf = form?._id && form._id === me?._id;
  const canManageAccess = me?.role === 'owner' || me?.role === 'admin';
  const protectedOwner = form?._id && form.role === 'owner' && me?.role !== 'owner';
  const accessLocked = Boolean(isSelf || protectedOwner || !canManageAccess);
  const roleOptions = ROLES.filter((role) => {
    if (!canManageAccess) return role === form?.role;
    if (role === 'owner' && me?.role !== 'owner' && form?.role !== 'owner') return false;
    return true;
  }).map((role) => ({ value: role, label: role[0].toUpperCase() + role.slice(1) }));

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Workspace / Access" title="Users" description="Manage who can access the workspace and what they can do." actions={<div className="flex flex-wrap items-center gap-2"><div className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/40 dark:text-violet-300">{items.length} members</div>{can('users', 'CREATE') && <ActionButton onClick={openCreate}><Plus className="h-4 w-4" /> New user</ActionButton>}</div>} />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!viewing} onClose={() => setViewing(null)} eyebrow="User details" title={viewing?.name || 'User'} description="Complete record with role, permissions, and attached files. Password hashes are never returned.">
        {viewing && <div className="space-y-5">
          <ViewSection title="Identity" count={viewing.role}>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ViewField label="Email" value={viewing.email} />
              <ViewField label="Phone" value={viewing.phone} />
              <ViewField label="Source" value={viewing.source} />
              <ViewField label="User ID" value={viewing._id} />
            </dl>
          </ViewSection>
          <ViewSection title="Profile">
            <dl className="grid gap-4"><ViewField label="Additional contact information" value={viewing.additionalContact} /><ViewField label="Bio" value={viewing.bio} /></dl>
          </ViewSection>
          <ViewSection title="Permissions" description="Actions this user can perform for each workspace resource.">
            <PermissionMatrix permissions={normalizePermissions(viewing.permissions)} disabled onToggle={() => {}} />
          </ViewSection>
          <ViewSection title="Files" description="Assets linked to this user." count={(viewing.files || []).length}>
            <ViewFiles files={viewing.files || []} parentEntity="user" />
          </ViewSection>
          <ViewSection title="Record metadata">
            <ViewTimestamps createdAt={viewing.createdAt} updatedAt={viewing.updatedAt} deletedAt={viewing.deletedAt} />
          </ViewSection>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setViewing(null)}>Close</ActionButton>{can('users', 'UPDATE') && (viewing.role !== 'owner' || me?.role === 'owner') && <ActionButton type="button" onClick={() => { setError(''); setForm(toForm(viewing)); setViewing(null); }}><Pencil className="h-4 w-4" /> Edit user</ActionButton>}</div>
        </div>}
      </Modal>

      <Modal open={!!form} onClose={() => !saving && setForm(null)} eyebrow={form?._id ? 'Editing user' : 'New user'} title={form?._id ? 'Update user access' : 'Create a workspace user'} description="Manage identity, access, permissions, and user files from one place.">
        {form && <form onSubmit={save}>
          <fieldset disabled={saving} className="space-y-6 border-0 p-0">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Full name" required><TextInput value={form.name} onChange={set('name')} required autoFocus autoComplete="name" /></Field>
              <Field label="Email" required><TextInput type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></Field>
              <Field label="Phone" hint="Must be unique when provided."><TextInput type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /></Field>
              <Field label="Role"><Select value={form.role} onChange={setRole} options={roleOptions} disabled={accessLocked} /></Field>
              <Field label="Source"><TextInput value={form.source} onChange={set('source')} placeholder="credentials" /></Field>
              <Field label={form._id ? 'New password' : 'Password'} required={!form._id} hint={form._id ? 'Leave blank to keep the current password.' : 'At least 8 characters and no more than 72 bytes.'}><TextInput type="password" value={form.password} onChange={set('password')} required={!form._id} minLength={form._id ? undefined : 8} autoComplete="new-password" /></Field>
            </div>
            <Field label="Additional contact information" hint="Store any alternate contact details here."><TextArea rows={3} value={form.additionalContact} onChange={set('additionalContact')} /></Field>
            <Field label="Bio" hint="A short profile description for this user."><TextArea rows={5} value={form.bio} onChange={set('bio')} /></Field>
            <PermissionMatrix permissions={form.permissions} disabled={saving || accessLocked} onToggle={togglePermission} onReset={resetPermissions} />
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Created at"><TextInput disabled value={formatDate(form.createdAt)} /></Field>
              <Field label="Updated at"><TextInput disabled value={formatDate(form.updatedAt)} /></Field>
              <Field label="Deleted at"><TextInput disabled value={formatDate(form.deletedAt)} /></Field>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">Password hashes are never returned or displayed. User file parent information, file name, path, size, MIME type, uploader, and timestamps are generated automatically.</p>
            <AttachmentField label="User files" hint="Upload a profile image or supporting files. Set title, alt text, and order for each file." files={form.attachments} existingFiles={form.existingFiles} metadata={form.attachmentMetadata} onChange={(attachments) => setForm((value) => ({ ...value, attachments }))} onMetadataChange={(attachmentMetadata) => setForm((value) => ({ ...value, attachmentMetadata }))} onExistingChange={(existingFiles) => setForm((value) => ({ ...value, existingFiles }))} onRemoveExisting={can('users', 'DELETE') ? removeAttachment : undefined} showMetadata disabled={saving || !!removingFileId || !can('users', 'UPDATE')} />
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setForm(null)}>Cancel</ActionButton><ActionButton type="submit" loading={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create user'}</ActionButton></div>
          </fieldset>
        </form>}
      </Modal>

      <AdminPanel className="overflow-hidden">
        <AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Team directory <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Search users, adjust roles, or open a profile to manage full access.</p></div><div className="flex flex-col gap-2 sm:flex-row"><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-full sm:w-56" /><Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} options={[{ value: '', label: 'All roles' }, ...ROLES.map((role) => ({ value: role, label: role[0].toUpperCase() + role.slice(1) }))]} className="w-full sm:w-36" /></div></AdminToolbar>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">User</th><th className="hidden px-4 py-3 sm:table-cell">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Files</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <tr><td colSpan={5} className="px-4 py-4"><div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /></td></tr> : filteredItems.map((item) => <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-xs font-extrabold text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">{(item.name || '?').slice(0, 1).toUpperCase()}</div><div><p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>{item._id === me?._id && <p className="text-xs text-indigo-500">That’s you</p>}</div></div></td><td className="hidden px-4 py-4 text-slate-500 sm:table-cell">{item.email}</td><td className="px-4 py-4">{can('users', 'UPDATE') && canManageAccess && item._id !== me?._id && item.role !== 'owner' ? <Field><Select value={item.role} onChange={(e) => changeRole(item, e.target.value)} options={ROLES} className="min-w-28" /></Field> : <div className="flex items-center gap-2"><Badge tone={ROLE_TONE[item.role] || 'slate'} dot>{item.role}</Badge>{item.role === 'owner' && <Badge tone="indigo">protected</Badge>}</div>}</td><td className="px-4 py-4 text-slate-500">{(item.files || []).length}</td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-1"><ActionButton variant="subtle" aria-label={`View ${item.name}`} onClick={() => setViewing(item)}><Eye className="h-4 w-4" /></ActionButton>{can('users', 'UPDATE') && (item.role !== 'owner' || me?.role === 'owner') && <ActionButton variant="subtle" aria-label={`Edit ${item.name}`} onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></ActionButton>}{can('users', 'DELETE') && item._id !== me?._id && (item.role !== 'owner' || me?.role === 'owner') && <ActionButton variant="subtle" aria-label={`Remove ${item.name}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton>}</div></td></tr>)}{!loading && filteredItems.length === 0 && <TableEmpty colSpan={5} icon={UsersIcon} title={search || roleFilter ? 'No matching users' : 'No users yet'} description={search || roleFilter ? 'Try a different search or role filter.' : 'Create the first workspace user.'} />}</tbody></table>
        </div>
      </AdminPanel>
    </div>
  );
}
