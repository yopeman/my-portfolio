import { useEffect, useMemo, useRef, useState } from 'react';
import { AtSign, Check, KeyRound, LoaderCircle, Mail, Phone, ShieldCheck, Trash2, UploadCloud, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { filesApi } from '../../api/files.js';
import { resolveFileUrl } from '../../services/adapters.js';
import { ActionButton, AdminHeader, AdminPanel, Badge, Field, TextArea, TextInput } from '../../components/admin/form.jsx';

const PROFILE_FIELDS = [
  { key: 'name', label: 'Full name', required: true, icon: UserRound, placeholder: 'Your name' },
  { key: 'email', label: 'Email', required: true, icon: Mail, type: 'email', placeholder: 'you@example.com' },
  { key: 'phone', label: 'Phone', icon: Phone, placeholder: 'Optional' },
  { key: 'additionalContact', label: 'Additional contact', icon: AtSign, placeholder: 'Telegram, LinkedIn, ...' },
];

const EMPTY_PASSWORD = { currentPassword: '', newPassword: '', confirmPassword: '' };

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A';
}

function isImage(file) {
  if (file?.mimeType) return file.mimeType.startsWith('image/');
  return /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(file?.path || file?.fileUrl || file?.name || '');
}

export default function ProfileAdmin() {
  const { user, updateProfile, can } = useAuth();
  const toForm = (source) => ({ name: source?.name || '', email: source?.email || '', phone: source?.phone || '', bio: source?.bio || '', additionalContact: source?.additionalContact || '' });
  const [form, setForm] = useState(() => toForm(user));
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState(null);
  const [profileError, setProfileError] = useState('');

  const [password, setPassword] = useState(EMPTY_PASSWORD);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [passwordError, setPasswordError] = useState('');

  const [avatar, setAvatar] = useState(null);
  const [avatarFiles, setAvatarFiles] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState(() => !user?._id || !can('users', 'UPDATE'));
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  const canManageFiles = can('users', 'UPDATE');

  useEffect(() => {
    if (!user?._id || !canManageFiles) return undefined;
    let active = true;
    filesApi
      .list({ parentEntity: 'user', parentId: user._id, limit: 100 })
      .then(({ items }) => {
        if (active) setAvatar((items || []).find(isImage) || null);
      })
      .catch(() => {
        if (active) setAvatar(null);
      })
      .finally(() => {
        if (active) setAvatarLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?._id, canManageFiles]);

  const avatarPreview = useMemo(() => (avatarFiles.length > 0 ? URL.createObjectURL(avatarFiles[0]) : avatar ? resolveFileUrl(avatar.fileUrl || avatar.path) : ''), [avatarFiles, avatar]);

  useEffect(() => () => { if (avatarFiles.length > 0) URL.revokeObjectURL(avatarPreview); }, [avatarPreview, avatarFiles.length]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setProfileErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingProfile(true);
    setProfileError('');
    setProfileNotice(null);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        additionalContact: form.additionalContact.trim(),
        bio: form.bio,
      };
      if (avatarFiles.length > 0) {
        await filesApi.upload('user', user._id, avatarFiles[0], undefined, { title: 'Avatar', alt: `${form.name.trim()} avatar` });
        setAvatarFiles([]);
      }
      if (avatar) await filesApi.remove(avatar._id);
      await updateProfile(payload);
      setProfileNotice('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Could not save your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!password.currentPassword) errors.currentPassword = 'Current password is required';
    if (!password.newPassword) errors.newPassword = 'New password is required';
    else if (password.newPassword.length < 8) errors.newPassword = 'Use at least 8 characters';
    else if (password.newPassword === password.currentPassword) errors.newPassword = 'New password must differ from the current one';
    if (password.newPassword !== password.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingPassword(true);
    setPasswordError('');
    setPasswordNotice(null);
    try {
      await updateProfile({ newPassword: password.newPassword, currentPassword: password.currentPassword });
      setPassword(EMPTY_PASSWORD);
      setPasswordNotice('Password changed successfully.');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Could not change your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const removeAvatar = () => {
    if (avatarFiles.length > 0) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarFiles([]);
      return;
    }
    if (avatar) filesApi.remove(avatar._id).then(() => setAvatar(null)).catch((err) => setAvatarError(err.response?.data?.error || 'Could not remove the avatar.'));
  };

  if (!user) return null;

  return (
    <div>
      <AdminHeader
        eyebrow="Account"
        title="My profile"
        description="Update the details attached to your admin account, manage your avatar and change your password."
        actions={<Badge tone="indigo" dot>{user.role}</Badge>}
      />

      {profileError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">{profileError}</p>}
      {passwordError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">{passwordError}</p>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={handleProfileSubmit} noValidate>
          <AdminPanel className="p-5 sm:p-6">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Profile details</h2>
            <p className="mt-1 text-xs text-slate-400">These details identify you across the workspace.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {PROFILE_FIELDS.map(({ key, label, required, icon: Icon, ...input }) => (
                <Field key={key} label={label} required={required} error={profileErrors[key]}>
                  <div className="relative">
                    {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
                    <TextInput
                      {...input}
                      className={Icon ? 'pl-9' : ''}
                      required={required}
                      value={form[key]}
                      onChange={(event) => setField(key, event.target.value)}
                    />
                  </div>
                </Field>
              ))}
              <Field className="sm:col-span-2" label="Bio" hint="A short introduction shown to other workspace members.">
                <TextArea rows={4} value={form.bio} onChange={(event) => setField('bio', event.target.value)} placeholder="Tell us a little about yourself" />
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ActionButton type="submit" loading={savingProfile} disabled={savingProfile}>Save profile</ActionButton>
              <ActionButton variant="neutral" type="button" disabled={savingProfile} onClick={() => { setForm(toForm(user)); setProfileErrors({}); setProfileNotice(null); setProfileError(''); }}>Reset</ActionButton>
              {profileNotice && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-300"><Check className="h-3.5 w-3.5" />{profileNotice}</span>}
            </div>
          </AdminPanel>
        </form>

        <div className="space-y-5">
          <AdminPanel className="p-5">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Avatar</h2>
            <p className="mt-1 text-xs text-slate-400">A square image works best (PNG or JPG, up to 20 MB).</p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-extrabold text-white shadow-lg shadow-indigo-500/20">
                {avatarLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : avatarPreview ? <img src={avatarPreview} alt="Your avatar" className="h-full w-full object-cover" /> : initials(user.name)}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                {canManageFiles ? (
                  <>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => {
                        const [file] = Array.from(event.target.files || []);
                        if (file) setAvatarFiles([file]);
                        if (event.target) event.target.value = '';
                      }}
                    />
                    <ActionButton variant="neutral" className="w-full" type="button" onClick={() => avatarInputRef.current?.click()} disabled={savingProfile}>
                      <UploadCloud className="h-3.5 w-3.5" />Upload image
                    </ActionButton>
                    {(avatar || avatarFiles.length > 0) && (
                      <ActionButton variant="subtle" className="w-full" type="button" onClick={removeAvatar} disabled={savingProfile}>
                        <Trash2 className="h-3.5 w-3.5" />Remove
                      </ActionButton>
                    )}
                    {avatarError && <p role="alert" className="text-xs font-semibold text-rose-500">{avatarError}</p>}
                    <p className="text-[10px] leading-relaxed text-slate-400">Uploads are applied when you save the profile.</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">You need the <span className="font-bold">users:update</span> permission to change this avatar.</p>
                )}
              </div>
            </div>
          </AdminPanel>

          <AdminPanel className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 dark:text-slate-100"><ShieldCheck className="h-4 w-4 text-indigo-500" />Access</h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3"><dt className="text-slate-400">Role</dt><dd className="font-bold capitalize text-slate-700 dark:text-slate-200">{user.role}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-slate-400">Signed up via</dt><dd className="font-bold capitalize text-slate-700 dark:text-slate-200">{user.source || 'credentials'}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-slate-400">Permissions</dt><dd className="text-right font-bold text-slate-700 dark:text-slate-200">{Object.entries(user.permissions || {}).filter(([, actions]) => actions.length > 0).map(([resource, actions]) => `${resource}:${actions.join('/')}`).join(', ') || 'None'}</dd></div>
            </dl>
            <p className="mt-4 text-[10px] leading-relaxed text-slate-400">Only the workspace owner can change your role and permissions.</p>
          </AdminPanel>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} noValidate className="mt-5">
        <AdminPanel className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 dark:text-slate-100"><KeyRound className="h-4 w-4 text-indigo-500" />Password</h2>
          <p className="mt-1 text-xs text-slate-400">Use at least 8 characters. You stay signed in after changing it.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="Current password" required error={passwordErrors.currentPassword}>
              <TextInput type="password" autoComplete="current-password" value={password.currentPassword} onChange={(event) => setPassword((prev) => ({ ...prev, currentPassword: event.target.value }))} />
            </Field>
            <Field label="New password" required error={passwordErrors.newPassword} hint="8 characters minimum">
              <TextInput type="password" autoComplete="new-password" value={password.newPassword} onChange={(event) => setPassword((prev) => ({ ...prev, newPassword: event.target.value }))} />
            </Field>
            <Field label="Confirm new password" required error={passwordErrors.confirmPassword}>
              <TextInput type="password" autoComplete="new-password" value={password.confirmPassword} onChange={(event) => setPassword((prev) => ({ ...prev, confirmPassword: event.target.value }))} />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ActionButton type="submit" loading={savingPassword} disabled={savingPassword}>Change password</ActionButton>
            {passwordNotice && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-300"><Check className="h-3.5 w-3.5" />{passwordNotice}</span>}
          </div>
        </AdminPanel>
      </form>
    </div>
  );
}
