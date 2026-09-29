import { useCallback, useEffect, useState } from 'react';
import { Check, ExternalLink, Eye, MessageSquare, Pencil, Plus, RotateCcw, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { filesApi } from '../../api/files.js';
import { aboutApi } from '../../api/about.js';
import { ActionButton, AdminHeader, AdminPanel, AttachmentField, Badge, Field, Modal, Select, TextArea, TextInput, ViewField, ViewFiles, ViewList, ViewSection, ViewTimestamps } from '../../components/admin/form.jsx';
import ViewEngagement from '../../components/admin/ViewEngagement.jsx';
import EngagementCell from '../../components/admin/EngagementCell.jsx';
import { engagementFor, useEngagement } from '../../components/admin/useEngagement.js';

const CONTACT_DEFAULT = { name: '', title: '', link: '', order: 0 };
const SKILL_DEFAULT = { category: '', name: '', progress: 50, order: 0 };
const EDUCATION_DEFAULT = {
  institution: '',
  degree: '',
  field: '',
  location: '',
  startDate: '',
  endDate: '',
  cgpa: '',
  description: '',
  link: '',
  order: 0,
};
const EXPERIENCE_DEFAULT = {
  company: '',
  role: '',
  type: 'full-time',
  location: '',
  remote: false,
  startDate: '',
  endDate: '',
  description: '',
  highlights: '',
  skills: '',
  link: '',
  order: 0,
};
const EXPERIENCE_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

const REPEATER_DEFAULTS = {
  contacts: CONTACT_DEFAULT,
  skills: SKILL_DEFAULT,
  educations: EDUCATION_DEFAULT,
  experiences: EXPERIENCE_DEFAULT,
};

function makeKey(prefix) {
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  return `${prefix}-${value}`;
}

function repeaterItems(items, defaults) {
  if (!Array.isArray(items) || items.length === 0) return [{ ...defaults, _key: makeKey('item') }];
  return items.map((item, index) => ({ ...defaults, ...(item || {}), _key: item?._key || makeKey('item'), order: item?.order ?? index }));
}

// The form edits highlights/skills as a single editable string, while the API
// stores them as string arrays.
function toTagString(value) {
  if (Array.isArray(value)) return value.join(', ');
  return String(value ?? '');
}

function emptyForm() {
  return {
    _id: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    headline: '',
    bio: '',
    contacts: [{ ...CONTACT_DEFAULT, _key: makeKey('contact') }],
    skills: [{ ...SKILL_DEFAULT, _key: makeKey('skill') }],
    educations: [{ ...EDUCATION_DEFAULT, _key: makeKey('education') }],
    experiences: [{ ...EXPERIENCE_DEFAULT, _key: makeKey('experience') }],
    attachments: [],
    attachmentMetadata: [],
    existingFiles: [],
    originalFiles: [],
  };
}

function toForm(about = {}) {
  const existingFiles = (about.files || []).map((file) => ({ ...file }));
  return {
    _id: about._id || null,
    createdAt: about.createdAt || null,
    updatedAt: about.updatedAt || null,
    deletedAt: about.deletedAt || null,
    headline: about.headline || '',
    bio: about.bio || '',
    contacts: repeaterItems(about.contacts, CONTACT_DEFAULT),
    skills: repeaterItems(about.skills, SKILL_DEFAULT),
    educations: repeaterItems(about.educations, EDUCATION_DEFAULT),
    experiences: repeaterItems(about.experiences, EXPERIENCE_DEFAULT).map((experience) => ({
      ...experience,
      highlights: toTagString(experience.highlights),
      skills: toTagString(experience.skills),
    })),
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

function formatMonthYear(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatPeriod(startDate, endDate, current = false) {
  const start = formatMonthYear(startDate);
  const end = current ? 'Present' : formatMonthYear(endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || 'Not set';
}

function formatBytes(value) {
  if (!Number.isFinite(Number(value))) return 'Not set';
  const bytes = Number(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeHref(value) {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function cleanContacts(contacts) {
  return (contacts || [])
    .filter((contact) => contact?.name?.trim() || contact?.title?.trim() || contact?.link?.trim())
    .map((contact, index) => ({
      name: contact.name?.trim() || '',
      title: contact.title?.trim() || '',
      link: contact.link?.trim() || '',
      order: contact.order === '' || contact.order === undefined || contact.order === null || !Number.isFinite(Number(contact.order)) ? index : Number(contact.order),
    }));
}

function cleanSkills(skills) {
  return (skills || [])
    .filter((skill) => skill?.category?.trim() || skill?.name?.trim())
    .map((skill, index) => {
      const progress = Number(skill.progress);
      const order = Number(skill.order);
      return {
        category: skill.category?.trim() || '',
        name: skill.name?.trim() || '',
        progress: Number.isFinite(progress) ? Math.min(100, Math.max(1, progress)) : 1,
        order: skill.order === '' || skill.order === undefined || skill.order === null || !Number.isFinite(order) ? index : order,
      };
    });
}

function cleanEducations(educations) {
  return (educations || [])
    .filter((education) => education?.institution?.trim() || education?.degree?.trim() || education?.field?.trim())
    .map((education, index) => {
      const order = Number(education.order);
      const cgpa = Number(education.cgpa);
      return {
        // The backend uses the _id to keep createdAt and to soft-delete, so it
        // must survive every round trip.
        ...(education._id ? { _id: education._id } : {}),
        institution: education.institution?.trim() || '',
        degree: education.degree?.trim() || '',
        field: education.field?.trim() || '',
        location: education.location?.trim() || '',
        startDate: education.startDate || null,
        endDate: education.endDate || null,
        cgpa: education.cgpa === '' || education.cgpa === null || education.cgpa === undefined || !Number.isFinite(cgpa) ? null : cgpa,
        description: education.description?.trim() || '',
        link: safeHref(education.link),
        order: education.order === '' || education.order === null || education.order === undefined || !Number.isFinite(order) ? index : order,
      };
    });
}

function cleanExperiences(experiences) {
  return (experiences || [])
    .filter((experience) => experience?.company?.trim() || experience?.role?.trim())
    .map((experience, index) => {
      const order = Number(experience.order);
      const type = EXPERIENCE_TYPES.includes(experience.type) ? experience.type : 'full-time';
      return {
        ...(experience._id ? { _id: experience._id } : {}),
        company: experience.company?.trim() || '',
        role: experience.role?.trim() || '',
        type,
        location: experience.location?.trim() || '',
        remote: experience.remote === true,
        startDate: experience.startDate || null,
        // A blank endDate means the role is current, so it is sent as null.
        endDate: experience.endDate || null,
        description: experience.description?.trim() || '',
        highlights: splitTags(experience.highlights),
        skills: splitTags(experience.skills),
        link: safeHref(experience.link),
        order: experience.order === '' || experience.order === null || experience.order === undefined || !Number.isFinite(order) ? index : order,
      };
    });
}

function splitTags(value) {
  return toTagString(value)
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function RepeaterField({ title, description, items, onAdd, onRemove, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
        </div>
        <ActionButton type="button" variant="neutral" onClick={onAdd}><Plus className="h-3.5 w-3.5" /> Add {title.replace(/s$/, '')}</ActionButton>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={item._key || `${title}-${index}`} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/70 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{title.replace(/s$/, '')} {index + 1}</span>
              <ActionButton type="button" variant="subtle" onClick={() => onRemove(index)} aria-label={`Remove ${title} ${index + 1}`}><Trash2 className="h-3.5 w-3.5" /></ActionButton>
            </div>
            {children(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

function FileRecordCard({ file }) {
  const details = [
    ['Parent entity', file.parentEntity || 'about'],
    ['Parent ID', file.parentId || 'Assigned on upload'],
    ['Order', file.order ?? 0],
    ['Title', file.title || '—'],
    ['Alt', file.alt || '—'],
    ['Name', file.name || '—'],
    ['Path', file.path || '—'],
    ['Size', formatBytes(file.size)],
    ['MIME type', file.mimeType || '—'],
    ['Uploaded by', file.uploadedBy || '—'],
    ['Created at', formatDate(file.createdAt)],
    ['Updated at', formatDate(file.updatedAt)],
    ['Deleted at', formatDate(file.deletedAt)],
  ];
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><UserRound className="h-4 w-4" /></div>
          <div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">{file.title || file.name || 'Profile file'}</p><p className="truncate text-xs text-slate-400">{file.name || 'Unnamed file'}</p></div>
        </div>
        <Badge tone="indigo">{file.mimeType || 'File'}</Badge>
      </div>
      <dl className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {details.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{label}</dt><dd className="mt-1 break-all text-xs font-semibold text-slate-600 dark:text-slate-300">{String(value)}</dd></div>)}
      </dl>
    </div>
  );
}

export default function AboutAdmin() {
  const { can } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingFileId, setRemovingFileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [about, setAbout] = useState(null);
  const [viewing, setViewing] = useState(null);
  const engagement = useEngagement('about', about?._id ? [about._id] : []);

  const load = useCallback(async () => {
    try {
      const result = await aboutApi.get();
      setForm(toForm(result.about));
      setAbout(result.about);
      setViewing(result.about);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) setError('');
      else setError(err.response?.data?.error || 'Unable to load profile.');
      setForm(emptyForm());
      setAbout(null);
      setViewing(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateForm = (updater) => {
    setForm(updater);
    setSaved(false);
  };

  const set = (key) => (event) => updateForm((current) => ({ ...current, [key]: event.target.value }));

  const updateRepeater = (collection, index, key, value) => updateForm((current) => ({
    ...current,
    [collection]: current[collection].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
  }));

  const addRepeater = (collection) => updateForm((current) => ({
    ...current,
    [collection]: [...current[collection], { ...REPEATER_DEFAULTS[collection], _key: makeKey(collection), order: current[collection].length }],
  }));

  const removeRepeater = (collection, index) => updateForm((current) => ({
    ...current,
    [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index),
  }));

  async function removeAttachment(file) {
    if (!window.confirm(`Remove “${file.name || 'this attachment'}” from your profile?`)) return;
    setRemovingFileId(file._id);
    setError('');
    try {
      await filesApi.remove(file._id);
      updateForm((current) => ({ ...current, existingFiles: current.existingFiles.filter((item) => item._id !== file._id) }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove attachment.');
    } finally {
      setRemovingFileId('');
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const payload = {
      headline: form.headline,
      bio: form.bio,
      contacts: cleanContacts(form.contacts),
      skills: cleanSkills(form.skills),
      educations: cleanEducations(form.educations),
      experiences: cleanExperiences(form.experiences),
    };
    try {
      const result = await aboutApi.update(payload);
      const about = result.about;
      const originalById = new Map((form.originalFiles || []).map((file) => [file._id, file]));
      const changedFiles = (form.existingFiles || []).filter((file) => {
        const original = originalById.get(file._id);
        return original && ['order', 'title', 'alt'].some((key) => String(file[key] ?? '') !== String(original[key] ?? ''));
      });
      try {
        if (changedFiles.length > 0) {
          await Promise.all(changedFiles.map((file) => filesApi.update(file._id, { order: Number(file.order) || 0, title: file.title || '', alt: file.alt || '' })));
        }
        if (form.attachments.length > 0) {
          await filesApi.uploadMany('about', about._id, form.attachments, undefined, form.attachmentMetadata);
        }
      } catch (uploadError) {
        const completedFiles = new Set(uploadError.completedFiles || []);
        setForm((current) => ({
          ...current,
          _id: about._id,
          existingFiles: [...current.existingFiles, ...(uploadError.uploaded || [])],
          originalFiles: [...current.originalFiles, ...(uploadError.uploaded || [])],
          attachments: current.attachments.filter((file) => !completedFiles.has(file)),
          attachmentMetadata: current.attachmentMetadata.filter((_, index) => !completedFiles.has(current.attachments[index])),
        }));
        setError('Profile saved, but one or more file changes could not be saved. Try again.');
        return;
      }
      await load();
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" /><div className="h-96 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" /></div>;

  const canUpdate = can('about', 'UPDATE');
  const canDelete = can('about', 'DELETE');
  const completedSections = [Boolean(form.headline.trim()), Boolean(form.bio.trim()), cleanContacts(form.contacts).length > 0, cleanSkills(form.skills).length > 0, cleanEducations(form.educations).length > 0, cleanExperiences(form.experiences).length > 0].filter(Boolean).length;
  const totalSections = 6;
  const readinessPercent = Math.round((completedSections / totalSections) * 100);
  const visibleContacts = cleanContacts(form.contacts).slice(0, 4);
  const visibleSkills = cleanSkills(form.skills).slice(0, 6);
  const visibleEducations = cleanEducations(form.educations).slice(0, 3);
  const visibleExperiences = cleanExperiences(form.experiences).slice(0, 3);

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Workspace / Profile" title="About" description="Shape the story, contact details, and capabilities visitors see across your portfolio." actions={<div className="flex flex-wrap items-center gap-2">{saved ? <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"><Check className="h-3.5 w-3.5" /> Changes saved</span> : <Badge tone="indigo">{completedSections}/{totalSections} sections ready</Badge>}<ActionButton variant="neutral" onClick={() => setViewing(about)} disabled={!about}><Eye className="h-4 w-4" /> View profile</ActionButton></div>} />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!viewing} onClose={() => setViewing(null)} eyebrow="Profile details" title={viewing?.headline || 'About profile'} description="Complete profile record with contacts, skills, experiences, educations, and attached files.">
        {viewing && <div className="space-y-5">
          <ViewSection title="Profile" count={viewing._id ? 'Saved' : 'Draft'}>
            <dl className="grid gap-4 sm:grid-cols-2"><ViewField label="Headline" value={viewing.headline} /><ViewField label="Bio" value={viewing.bio} /></dl>
          </ViewSection>
          <ViewSection title="Contacts" description="Directory of people and links shown across the site." count={(viewing.contacts || []).length}>
            <ViewList items={viewing.contacts || []} empty="No contacts recorded.">
              {(contact) => <dl className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_4rem]"><ViewField label="Name" value={contact.name} /><ViewField label="Title" value={contact.title} /><ViewField label="Link" value={contact.link} /><ViewField label="Order" value={contact.order} /></dl>}
            </ViewList>
          </ViewSection>
          <ViewSection title="Skills" description="Capabilities grouped by category with progress from 1–100." count={(viewing.skills || []).length}>
            <ViewList items={viewing.skills || []} empty="No skills recorded.">
              {(skill) => <dl className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem_5rem]"><ViewField label="Category" value={skill.category} /><ViewField label="Name" value={skill.name} /><ViewField label="Progress" value={skill.progress} /><ViewField label="Order" value={skill.order} /></dl>}
            </ViewList>
          </ViewSection>
          <ViewSection title="Educations" description="Academic history shown on the public timeline." count={(viewing.educations || []).length}>
            <ViewList items={viewing.educations || []} empty="No educations recorded.">
              {(education) => <dl className="grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_0.8fr]"><ViewField label="Institution" value={education.institution} /><ViewField label="Degree" value={[education.degree, education.field].filter(Boolean).join(' · ')} /><ViewField label="Location" value={education.location} /><ViewField label="CGPA" value={education.cgpa} /><ViewField label="Period" value={formatPeriod(education.startDate, education.endDate)} /><ViewField label="Description" value={education.description} /><ViewField label="Link" value={education.link} /><ViewField label="Order" value={education.order} /><ViewField label="Created at" value={formatDate(education.createdAt)} /><ViewField label="Updated at" value={formatDate(education.updatedAt)} /></dl>}
            </ViewList>
          </ViewSection>
          <ViewSection title="Experiences" description="Roles and engagements, newest first." count={(viewing.experiences || []).length}>
            <ViewList items={viewing.experiences || []} empty="No experiences recorded.">
              {(experience) => <dl className="grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_0.8fr]"><ViewField label="Role" value={experience.role} /><ViewField label="Company" value={experience.company} /><ViewField label="Type" value={experience.type} /><ViewField label="Remote" value={experience.remote ? 'Yes' : 'No'} /><ViewField label="Location" value={experience.location} /><ViewField label="Period" value={formatPeriod(experience.startDate, experience.endDate, !experience.endDate)} /><ViewField label="Description" value={experience.description} /><ViewField label="Highlights" value={(experience.highlights || []).join(', ')} /><ViewField label="Skills" value={(experience.skills || []).join(', ')} /><ViewField label="Link" value={experience.link} /><ViewField label="Order" value={experience.order} /><ViewField label="Created at" value={formatDate(experience.createdAt)} /><ViewField label="Updated at" value={formatDate(experience.updatedAt)} /></dl>}
            </ViewList>
          </ViewSection>
          <ViewSection title="Files" description="Assets linked to this profile." count={(viewing.files || []).length}>
            <ViewFiles files={viewing.files || []} parentEntity="about" />
          </ViewSection>
          {viewing._id && <ViewEngagement parentEntity="about" parentId={viewing._id} className="space-y-4" />}
          <ViewSection title="Record metadata">
            <ViewTimestamps createdAt={viewing.createdAt} updatedAt={viewing.updatedAt} deletedAt={viewing.deletedAt} extra={[["ID", viewing._id]]} />
          </ViewSection>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setViewing(null)}>Close</ActionButton>{can('about', 'UPDATE') && <ActionButton type="button" onClick={() => setViewing(null)}><Pencil className="h-4 w-4" /> Back to editing</ActionButton>}</div>
        </div>}
      </Modal>

      <form onSubmit={save}>
        <fieldset disabled={!canUpdate} className="grid gap-5 border-0 p-0 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <AdminPanel className="space-y-6 p-5 sm:p-7">
              <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20"><Sparkles className="h-5 w-5" /></div><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-violet-400">Public profile</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">The essentials</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">These fields appear across your public site and form the foundation of your introduction.</p></div></div>
              <Field label="Headline" hint="A short, specific sentence that sets the tone."><TextInput value={form.headline} onChange={set('headline')} placeholder="Backend-Focused Software Developer" /></Field>
              <Field label="Bio" hint="Markdown is supported. Tell visitors what you build and why it matters."><TextArea rows={12} value={form.bio} onChange={set('bio')} className="leading-7" placeholder="I build reliable products..." /></Field>
            </AdminPanel>

            <AdminPanel className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-violet-400">Contact directory</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Contacts</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">Keep names, roles, links, and display order explicit.</p></div><Badge tone="indigo">{cleanContacts(form.contacts).length} contacts</Badge></div>
              <RepeaterField title="Contacts" description="Each contact can include a name, professional title, link, and display order." items={form.contacts} onAdd={() => addRepeater('contacts')} onRemove={(index) => removeRepeater('contacts', index)}>
                {(contact, index) => <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_5rem]"><Field label="Name"><TextInput value={contact.name || ''} onChange={(event) => updateRepeater('contacts', index, 'name', event.target.value)} placeholder="Your name" /></Field><Field label="Title"><TextInput value={contact.title || ''} onChange={(event) => updateRepeater('contacts', index, 'title', event.target.value)} placeholder="Software developer" /></Field><Field label="Link"><TextInput type="text" value={contact.link || ''} onChange={(event) => updateRepeater('contacts', index, 'link', event.target.value)} placeholder="https://..." /></Field><Field label="Order"><TextInput type="number" min="0" value={contact.order ?? 0} onChange={(event) => updateRepeater('contacts', index, 'order', event.target.value === '' ? '' : Number(event.target.value))} /></Field></div>}
              </RepeaterField>
            </AdminPanel>

            <AdminPanel className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-violet-400">Capability map</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Skills</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">Group skills by category, show progress from 1–100, and control their order.</p></div><Badge tone="green">{cleanSkills(form.skills).length} skills</Badge></div>
              <RepeaterField title="Skills" description="Progress is constrained to the database range of 1–100; order supports decimal values." items={form.skills} onAdd={() => addRepeater('skills')} onRemove={(index) => removeRepeater('skills', index)}>
                {(skill, index) => <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_11rem_6rem]"><Field label="Category"><TextInput value={skill.category || ''} onChange={(event) => updateRepeater('skills', index, 'category', event.target.value)} placeholder="Backend" /></Field><Field label="Name"><TextInput value={skill.name || ''} onChange={(event) => updateRepeater('skills', index, 'name', event.target.value)} placeholder="Node.js" /></Field><Field label="Progress"><div className="flex items-center gap-2"><input type="range" min="1" max="100" step="1" value={skill.progress === '' ? 1 : skill.progress ?? 1} onChange={(event) => updateRepeater('skills', index, 'progress', Number(event.target.value))} className="h-2 min-w-0 flex-1 cursor-pointer accent-indigo-600" /><TextInput type="number" min="1" max="100" value={skill.progress ?? 1} onChange={(event) => updateRepeater('skills', index, 'progress', event.target.value === '' ? '' : Number(event.target.value))} className="w-20 px-2.5 py-2" /></div></Field><Field label="Order"><TextInput type="number" step="0.1" value={skill.order ?? 0} onChange={(event) => updateRepeater('skills', index, 'order', event.target.value === '' ? '' : Number(event.target.value))} /></Field></div>}
              </RepeaterField>
            </AdminPanel>

            <AdminPanel className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-violet-400">Career timeline</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Experiences</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">Record each role with its type, period, and impact. Leave the end date empty for a current position.</p></div><Badge tone="indigo">{cleanExperiences(form.experiences).length} experiences</Badge></div>
              <RepeaterField title="Experiences" description="Highlights and skills are comma-separated. A blank end date marks the current role." items={form.experiences} onAdd={() => addRepeater('experiences')} onRemove={(index) => removeRepeater('experiences', index)}>
                {(experience, index) => <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_10rem]">
                    <Field label="Role"><TextInput value={experience.role || ''} onChange={(event) => updateRepeater('experiences', index, 'role', event.target.value)} placeholder="Backend Developer" /></Field>
                    <Field label="Company"><TextInput value={experience.company || ''} onChange={(event) => updateRepeater('experiences', index, 'company', event.target.value)} placeholder="Acme Corp" /></Field>
                    <Field label="Type"><Select value={experience.type || 'full-time'} options={EXPERIENCE_TYPES.map((type) => ({ value: type, label: type }))} onChange={(event) => updateRepeater('experiences', index, 'type', event.target.value)} /></Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_5rem]">
                    <Field label="Location"><TextInput value={experience.location || ''} onChange={(event) => updateRepeater('experiences', index, 'location', event.target.value)} placeholder="Addis Ababa" /></Field>
                    <Field label="Start date"><TextInput type="date" value={experience.startDate || ''} onChange={(event) => updateRepeater('experiences', index, 'startDate', event.target.value)} /></Field>
                    <Field label="End date" hint="Leave empty for current."><TextInput type="date" value={experience.endDate || ''} onChange={(event) => updateRepeater('experiences', index, 'endDate', event.target.value)} /></Field>
                    <Field label="Order"><TextInput type="number" step="0.1" value={experience.order ?? 0} onChange={(event) => updateRepeater('experiences', index, 'order', event.target.value === '' ? '' : Number(event.target.value))} /></Field>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <input type="checkbox" checked={experience.remote === true} onChange={(event) => updateRepeater('experiences', index, 'remote', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900" />
                      Remote role
                    </label>
                  </div>
                  <Field label="Description"><TextArea rows={3} value={experience.description || ''} onChange={(event) => updateRepeater('experiences', index, 'description', event.target.value)} placeholder="What you owned and what shipped…" /></Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Highlights" hint="Comma-separated."><TextArea rows={3} value={toTagString(experience.highlights)} onChange={(event) => updateRepeater('experiences', index, 'highlights', event.target.value)} placeholder="Cut latency by 40%" /></Field>
                    <Field label="Skills" hint="Comma-separated."><TextArea rows={3} value={toTagString(experience.skills)} onChange={(event) => updateRepeater('experiences', index, 'skills', event.target.value)} placeholder="Node.js, PostgreSQL" /></Field>
                  </div>
                  <Field label="Link"><TextInput type="text" value={experience.link || ''} onChange={(event) => updateRepeater('experiences', index, 'link', event.target.value)} placeholder="https://..." /></Field>
                </div>}
              </RepeaterField>
            </AdminPanel>

            <AdminPanel className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Academic background</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Educations</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">Add each qualification with its institution, field of study, period, and grade.</p></div><Badge tone="green">{cleanEducations(form.educations).length} educations</Badge></div>
              <RepeaterField title="Educations" description="CGPA is optional and must fall between 0 and 10." items={form.educations} onAdd={() => addRepeater('educations')} onRemove={(index) => removeRepeater('educations', index)}>
                {(education, index) => <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
                    <Field label="Institution"><TextInput value={education.institution || ''} onChange={(event) => updateRepeater('educations', index, 'institution', event.target.value)} placeholder="Addis Ababa University" /></Field>
                    <Field label="Degree"><TextInput value={education.degree || ''} onChange={(event) => updateRepeater('educations', index, 'degree', event.target.value)} placeholder="BSc" /></Field>
                    <Field label="Field"><TextInput value={education.field || ''} onChange={(event) => updateRepeater('educations', index, 'field', event.target.value)} placeholder="Computer Science" /></Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_7rem]">
                    <Field label="Location"><TextInput value={education.location || ''} onChange={(event) => updateRepeater('educations', index, 'location', event.target.value)} placeholder="Addis Ababa, Ethiopia" /></Field>
                    <Field label="Start date"><TextInput type="date" value={education.startDate || ''} onChange={(event) => updateRepeater('educations', index, 'startDate', event.target.value)} /></Field>
                    <Field label="End date"><TextInput type="date" value={education.endDate || ''} onChange={(event) => updateRepeater('educations', index, 'endDate', event.target.value)} /></Field>
                    <Field label="CGPA"><TextInput type="number" min="0" max="10" step="0.01" value={education.cgpa ?? ''} onChange={(event) => updateRepeater('educations', index, 'cgpa', event.target.value === '' ? '' : Number(event.target.value))} placeholder="3.85" /></Field>
                  </div>
                  <Field label="Description"><TextArea rows={3} value={education.description || ''} onChange={(event) => updateRepeater('educations', index, 'description', event.target.value)} placeholder="Thesis, honours, coursework…" /></Field>
                  <div className="grid gap-3 sm:grid-cols-[1fr_5rem]">
                    <Field label="Link"><TextInput type="text" value={education.link || ''} onChange={(event) => updateRepeater('educations', index, 'link', event.target.value)} placeholder="https://..." /></Field>
                    <Field label="Order"><TextInput type="number" step="0.1" value={education.order ?? 0} onChange={(event) => updateRepeater('educations', index, 'order', event.target.value === '' ? '' : Number(event.target.value))} /></Field>
                  </div>
                </div>}
              </RepeaterField>
            </AdminPanel>

            <AdminPanel className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-violet-400">Media library</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Profile files</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">Upload profile images and supporting files. Editable metadata is shown inline.</p></div><Badge tone="slate">{form.existingFiles.length + form.attachments.length} files</Badge></div>
              <AttachmentField label="About files" hint="Upload images or supporting documents. Set title, alt text, and order for each file." files={form.attachments} existingFiles={form.existingFiles} metadata={form.attachmentMetadata} onChange={(attachments) => updateForm((current) => ({ ...current, attachments }))} onMetadataChange={(attachmentMetadata) => updateForm((current) => ({ ...current, attachmentMetadata }))} onExistingChange={(existingFiles) => updateForm((current) => ({ ...current, existingFiles }))} onRemoveExisting={canDelete ? removeAttachment : undefined} showMetadata disabled={saving || !!removingFileId || !canUpdate} />
              <p className="text-[10px] leading-relaxed text-slate-400">Parent entity and ID, name, path, size, MIME type, uploader, and timestamps are generated by the backend. Only order, title, and alt are editable.</p>
              {form.existingFiles.length > 0 && <div className="space-y-3 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><div><h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">File record details</h3><p className="mt-1 text-xs text-slate-400">Read-only values stored for each uploaded About file.</p></div>{form.existingFiles.map((file) => <FileRecordCard key={file._id} file={file} />)}</div>}
            </AdminPanel>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <AdminPanel className="overflow-hidden p-0">
              <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><Sparkles className="h-5 w-5" /></div><span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]">Live preview</span></div><p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-100">Public introduction</p><h2 className="mt-2 text-2xl font-extrabold leading-tight">{form.headline || 'Your professional headline'}</h2></div>
              <div className="space-y-5 p-5"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Bio preview</p><p className="mt-2 line-clamp-8 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">{form.bio || 'Your bio will appear here once you add it.'}</p></div><div className="h-px bg-slate-200/70 dark:bg-slate-800/70" /><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Contact preview</p><div className="mt-3 space-y-2">{visibleContacts.length > 0 ? visibleContacts.map((contact, index) => { const href = safeHref(contact.link); return <div key={`${contact.name}-${index}`} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1.5 font-bold text-indigo-600 hover:underline dark:text-violet-300"><ExternalLink className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{contact.name || contact.title || 'Contact'}</span></a> : <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold"><UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">{contact.name || contact.title || 'Contact'}</span></span>}{contact.title && <span className="truncate text-slate-400">· {contact.title}</span>}</div>; }) : <p className="text-xs text-slate-400">No contacts added yet.</p>}</div></div>                <div className="h-px bg-slate-200/70 dark:bg-slate-800/70" /><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Experience preview</p><div className="mt-3 space-y-2">{visibleExperiences.length > 0 ? visibleExperiences.map((experience, index) => <div key={experience._id || `${experience.company}-${index}`} className="min-w-0"><p className="truncate text-xs font-extrabold text-slate-700 dark:text-slate-200">{experience.role || experience.company}</p><p className="truncate text-xs text-slate-400">{[experience.company, experience.location, experience.remote ? 'Remote' : ''].filter(Boolean).join(' · ')}</p><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-violet-400">{formatPeriod(experience.startDate, experience.endDate, !experience.endDate)}</p></div>) : <p className="text-xs text-slate-400">No experiences added yet.</p>}</div></div>
                <div className="h-px bg-slate-200/70 dark:bg-slate-800/70" /><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Education preview</p><div className="mt-3 space-y-2">{visibleEducations.length > 0 ? visibleEducations.map((education, index) => <div key={education._id || `${education.institution}-${index}`} className="min-w-0"><p className="truncate text-xs font-extrabold text-slate-700 dark:text-slate-200">{education.institution || education.degree}</p><p className="truncate text-xs text-slate-400">{[education.degree, education.field].filter(Boolean).join(' · ')}</p><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">{formatPeriod(education.startDate, education.endDate)}</p></div>) : <p className="text-xs text-slate-400">No educations added yet.</p>}</div></div>
                <div className="h-px bg-slate-200/70 dark:bg-slate-800/70" /><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Skill preview</p><div className="mt-3 space-y-3">{visibleSkills.length > 0 ? visibleSkills.map((skill, index) => <div key={`${skill.name}-${index}`}><div className="flex items-center justify-between gap-3 text-xs"><span className="truncate font-semibold text-slate-600 dark:text-slate-300">{skill.name || skill.category}</span><span className="font-bold text-slate-400">{skill.progress}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${Math.min(100, Math.max(1, Number(skill.progress) || 1))}%` }} /></div></div>) : <p className="text-xs text-slate-400">No skills added yet.</p>}</div></div></div>
            </AdminPanel>

            <AdminPanel className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Engagement</p>
                </div>
              </div>
              <div className="mt-3">
                {about?._id
                  ? <EngagementCell stats={engagementFor(engagement, about._id)} onClick={() => setViewing(about)} />
                  : <p className="text-xs text-slate-400">Save the profile to start collecting feedback.</p>}
              </div>
            </AdminPanel>

            <AdminPanel className="p-5">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Profile readiness</p><p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">{completedSections} of {totalSections} sections ready</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-indigo-100 text-sm font-extrabold text-indigo-600 dark:border-indigo-950 dark:text-indigo-300">{readinessPercent}%</div></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${readinessPercent}%` }} /></div>
            </AdminPanel>

            <AdminPanel className="p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Record metadata</p>
              <dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between gap-4"><dt className="text-slate-400">Created at</dt><dd className="text-right font-semibold text-slate-600 dark:text-slate-300">{formatDate(form.createdAt)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">Updated at</dt><dd className="text-right font-semibold text-slate-600 dark:text-slate-300">{formatDate(form.updatedAt)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">Deleted at</dt><dd className="text-right font-semibold text-slate-600 dark:text-slate-300">{formatDate(form.deletedAt)}</dd></div></dl>
            </AdminPanel>
          </aside>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 xl:col-span-2 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={load} disabled={saving}><RotateCcw className="h-3.5 w-3.5" /> Reset</ActionButton><ActionButton type="submit" loading={saving} disabled={!canUpdate}>{saving ? 'Saving…' : 'Save profile'}</ActionButton></div>
        </fieldset>
      </form>
    </div>
  );
}
