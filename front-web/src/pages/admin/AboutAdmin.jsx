import { useCallback, useEffect, useState } from 'react';
import { aboutApi } from '../../api/about.js';
import { Field, TextArea, TextInput, ActionButton } from '../../components/admin/form.jsx';

export default function AboutAdmin() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    aboutApi
      .get()
      .then((r) => {
        const a = r.about || {};
        setForm({
          headline: a.headline || '',
          bio: a.bio || '',
          contacts: (a.contacts || []).map((c) => `${c.title || c.name}: ${c.link ?? ''}`).join('\n'),
          skills: (a.skills || []).map((s) => `${s.category}: ${s.name}`).join('\n'),
        });
      })
      .catch(() => {
        setForm({ headline: '', bio: '', contacts: '', skills: '' });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const contacts = form.contacts
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const [title, ...rest] = line.split(':');
        return { title: title.trim(), name: title.trim(), link: rest.join(':').trim(), order: i };
      });
    const skills = form.skills
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const [category, ...rest] = line.split(':');
        return { category: category.trim(), name: rest.join(':').trim() || category.trim(), order: i };
      });
    try {
      await aboutApi.update({ headline: form.headline, bio: form.bio, contacts, skills });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save about');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">About</h1>
      <form onSubmit={save} className="admin-surface rounded-2xl p-5 space-y-4 max-w-3xl">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Saved successfully.</p>}
        <Field label="Headline">
          <TextInput value={form.headline} onChange={set('headline')} placeholder="Backend-Focused Software Developer" />
        </Field>
        <Field label="Bio (Markdown)">
          <TextArea rows={8} value={form.bio} onChange={set('bio')} />
        </Field>
        <Field label="Contacts (one per line: `Title: value`)">
          <TextArea rows={7} value={form.contacts} onChange={set('contacts')} className="font-mono text-xs" />
        </Field>
        <Field label="Skills (one per line: `Category: name`)">
          <TextArea rows={12} value={form.skills} onChange={set('skills')} className="font-mono text-xs" />
        </Field>
        <div className="flex gap-2">
          <ActionButton variant="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</ActionButton>
          <ActionButton variant="neutral" type="button" onClick={load}>Reset</ActionButton>
        </div>
      </form>
    </div>
  );
}