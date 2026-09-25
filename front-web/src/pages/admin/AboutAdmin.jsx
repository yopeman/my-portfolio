import { useCallback, useEffect, useState } from 'react';
import { Check, RotateCcw, Sparkles } from 'lucide-react';
import { filesApi } from '../../api/files.js';
import { aboutApi } from '../../api/about.js';
import { ActionButton, AdminHeader, AdminPanel, AttachmentField, Field, TextArea, TextInput } from '../../components/admin/form.jsx';

function emptyForm() {
  return { headline: '', bio: '', contacts: '', skills: '', attachments: [], existingFiles: [] };
}

export default function AboutAdmin() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingFileId, setRemovingFileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await aboutApi.get();
      const about = result.about || {};
      setForm({
        headline: about.headline || '',
        bio: about.bio || '',
        contacts: (about.contacts || []).map((contact) => `${contact.title || contact.name}: ${contact.link ?? ''}`).join('\n'),
        skills: (about.skills || []).map((skill) => `${skill.category}: ${skill.name}`).join('\n'),
        attachments: [],
        existingFiles: about.files || [],
      });
      setError('');
    } catch (err) {
      if (err.response?.status !== 404) setError(err.response?.data?.error || 'Unable to load profile.');
      setForm(emptyForm());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const set = (key) => (e) => {
    setForm((value) => ({ ...value, [key]: e.target.value }));
    setSaved(false);
  };

  async function removeAttachment(file) {
    if (!window.confirm(`Remove “${file.name || 'this attachment'}” from your profile?`)) return;
    setRemovingFileId(file._id);
    setError('');
    try {
      await filesApi.remove(file._id);
      setForm((value) => ({ ...value, existingFiles: value.existingFiles.filter((item) => item._id !== file._id) }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove attachment.');
    } finally {
      setRemovingFileId('');
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const contacts = form.contacts.split('\n').map((line) => line.trim()).filter(Boolean).map((line, index) => {
      const [title, ...rest] = line.split(':');
      return { title: title.trim(), name: title.trim(), link: rest.join(':').trim(), order: index };
    });
    const skills = form.skills.split('\n').map((line) => line.trim()).filter(Boolean).map((line, index) => {
      const [category, ...rest] = line.split(':');
      return { category: category.trim(), name: rest.join(':').trim() || category.trim(), order: index };
    });
    try {
      const result = await aboutApi.update({ headline: form.headline, bio: form.bio, contacts, skills });
      const about = result.about;
      if (form.attachments.length > 0) {
        try {
          const uploaded = await filesApi.uploadMany('about', about._id, form.attachments);
          setForm((value) => ({ ...value, attachments: [], existingFiles: [...value.existingFiles, ...uploaded] }));
        } catch {
          setError('Profile saved, but one or more attachments could not be uploaded. Try again.');
          return;
        }
      }
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" /><div className="h-96 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" /></div>;

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Workspace / Profile" title="About" description="Keep your public introduction, links, and skills in one calm place." actions={saved ? <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"><Check className="h-3.5 w-3.5" /> Changes saved</span> : null} />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
      <form onSubmit={save} className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
        <AdminPanel className="space-y-6 p-5 sm:p-7">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-violet-400">Public profile</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">The essentials</h2><p className="mt-1 text-sm text-slate-400">These fields appear across your public site.</p></div>
          <Field label="Headline" hint="A short sentence that sets the tone."><TextInput value={form.headline} onChange={set('headline')} placeholder="Backend-Focused Software Developer" /></Field>
          <Field label="Bio" hint="Markdown is supported."><TextArea rows={12} value={form.bio} onChange={set('bio')} className="leading-7" /></Field>
          <div className="grid gap-5 md:grid-cols-2"><Field label="Contacts" hint="One per line: Title: link"><TextArea rows={8} value={form.contacts} onChange={set('contacts')} className="font-mono text-xs" /></Field><Field label="Skills" hint="One per line: Category: name"><TextArea rows={8} value={form.skills} onChange={set('skills')} className="font-mono text-xs" /></Field></div>
          <AttachmentField label="Profile attachments" hint="Upload profile images or supporting files here. They will be linked automatically when you save." files={form.attachments} existingFiles={form.existingFiles} onChange={(attachments) => { setForm((value) => ({ ...value, attachments })); setSaved(false); }} onRemoveExisting={removeAttachment} disabled={saving || !!removingFileId} />
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={load} disabled={saving}><RotateCcw className="h-3.5 w-3.5" /> Reset</ActionButton><ActionButton type="submit" loading={saving}>{saving ? 'Saving…' : 'Save changes'}</ActionButton></div>
        </AdminPanel>
        <AdminPanel className="h-fit overflow-hidden p-0">
          <div className="border-b border-slate-200/70 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white dark:border-slate-800/70"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><Sparkles className="h-5 w-5" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-100">Live preview</p><h3 className="mt-2 text-xl font-extrabold">{form.headline || 'Your professional headline'}</h3></div>
          <div className="space-y-5 p-5"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">About preview</p><p className="mt-2 line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">{form.bio || 'Your bio will appear here once you add it.'}</p></div><div className="h-px bg-slate-200/70 dark:bg-slate-800/70" /><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Content summary</p><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950/40"><p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-300">{form.contacts.split('\n').filter(Boolean).length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500/70 dark:text-indigo-300/60">Contacts</p></div><div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-950/40"><p className="text-lg font-extrabold text-violet-600 dark:text-violet-300">{form.skills.split('\n').filter(Boolean).length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-violet-500/70 dark:text-violet-300/60">Skills</p></div></div></div></div>
        </AdminPanel>
      </form>
    </div>
  );
}
