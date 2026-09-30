import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarRange, ChevronRight, Eye, Pencil, Plus, Target, Trash2, UserRound, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { filesApi } from '../../api/files.js';
import { plansApi } from '../../api/plans.js';
import { ActionButton, AdminHeader, AdminPanel, AdminToolbar, AttachmentField, Badge, Field, LoadingRows, Modal, SearchInput, Select, TableEmpty, TextArea, TextInput, ViewField, ViewFiles, ViewList, ViewSection, ViewTimestamps } from '../../components/admin/form.jsx';
import { refLabel } from '../../components/admin/view-utils.js';
import ViewEngagement from '../../components/admin/ViewEngagement.jsx';
import EngagementCell from '../../components/admin/EngagementCell.jsx';
import { engagementFor, useEngagement } from '../../components/admin/useEngagement.js';

const PERIODS = ['year', 'half', 'quarter', 'month', 'week', 'day'];
// Ordered from most to least privileged: owner > admin > member > user > guest.
const VISIBILITIES = ['owner', 'admin', 'member', 'user', 'guest'];
const VISIBILITY_LABELS = {
  owner: 'Owner and above',
  admin: 'Admin and above',
  member: 'Member and above',
  user: 'Signed-in users',
  guest: 'Everyone (public)',
};
const CHECKLIST_STATUSES = ['pending', 'in progress', 'completed', 'cancelled', 'failed'];
const CHECKLIST_DEFAULT = { title: '', description: '', status: 'pending', order: 0 };

function normalizeVisibilityValue(value) {
  if (VISIBILITIES.includes(value)) return value;
  if (Array.isArray(value)) {
    const valid = value.filter((item) => VISIBILITIES.includes(item));
    if (valid.length > 0) return valid[0];
  }
  return 'guest';
}

function makeKey(prefix) {
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  return `${prefix}-${value}`;
}

function emptyForm() {
  return {
    _id: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    title: '',
    slug: '',
    visibility: 'guest',
    period: 'year',
    year: new Date().getFullYear(),
    periodNumber: 1,
    parentPlan: null,
    description: '',
    goal: '',
    target: '',
    checklists: [{ ...CHECKLIST_DEFAULT, _key: makeKey('checklist') }],
    startDate: '',
    endDate: '',
    assignedTo: [],
    attachments: [],
    attachmentMetadata: [],
    existingFiles: [],
    originalFiles: [],
  };
}

function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function toForm(item) {
  const existingFiles = (item.files || []).map((file) => ({ ...file }));
  const activeChecklists = Array.isArray(item.checklists) ? item.checklists.filter((checklist) => !checklist.deletedAt) : [];
  const checklists = activeChecklists.length > 0
    ? activeChecklists.map((checklist, index) => ({ ...CHECKLIST_DEFAULT, ...checklist, _key: checklist._id || makeKey(`checklist-${index}`) }))
    : [{ ...CHECKLIST_DEFAULT, _key: makeKey('checklist') }];
  return {
    ...emptyForm(),
    ...item,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    deletedAt: item.deletedAt || null,
    visibility: normalizeVisibilityValue(item.visibility),
    periodNumber: item.periodNumber ?? 1,
    parentPlan: item.parentPlan || null,
    startDate: toDateInput(item.startDate),
    endDate: toDateInput(item.endDate),
    assignedTo: Array.isArray(item.assignedTo) ? item.assignedTo.map(String) : [],
    checklists,
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

function formatBytes(value) {
  if (!Number.isFinite(Number(value))) return 'Not set';
  const bytes = Number(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function cleanChecklists(checklists) {
  return (checklists || [])
    .filter((checklist) => checklist?.title?.trim() || checklist?.description?.trim())
    .map((checklist, index) => ({
      ...(checklist._id ? { _id: checklist._id } : {}),
      title: checklist.title?.trim() || '',
      description: checklist.description?.trim() || '',
      status: CHECKLIST_STATUSES.includes(checklist.status) ? checklist.status : 'pending',
      order: checklist.order === '' || checklist.order === undefined || checklist.order === null || !Number.isFinite(Number(checklist.order)) ? index : Number(checklist.order),
    }));
}

function planMap(plans) {
  return new Map((plans || []).map((plan) => [String(plan._id), plan]));
}

function planDepth(plan, map) {
  let depth = 0;
  let parentId = plan.parentPlan ? String(plan.parentPlan) : '';
  const visited = new Set();
  while (parentId && map.has(parentId) && !visited.has(parentId)) {
    visited.add(parentId);
    depth += 1;
    parentId = map.get(parentId).parentPlan ? String(map.get(parentId).parentPlan) : '';
  }
  return depth;
}

function descendantIds(rootId, plans) {
  const ids = new Set();
  let parents = [String(rootId)];
  while (parents.length > 0) {
    const children = plans.filter((plan) => plan.parentPlan && parents.includes(String(plan.parentPlan)) && !ids.has(String(plan._id))).map((plan) => String(plan._id));
    if (children.length === 0) break;
    children.forEach((id) => ids.add(id));
    parents = children;
  }
  return ids;
}

function sortedPlanRows(plans) {
  const map = planMap(plans);
  return [...plans].sort((a, b) => {
    const yearDifference = (b.year ?? -Infinity) - (a.year ?? -Infinity);
    if (yearDifference) return yearDifference;
    const periodDifference = (a.periodNumber ?? 0) - (b.periodNumber ?? 0);
    if (periodDifference) return periodDifference;
    return planDepth(a, map) - planDepth(b, map) || String(a.title || '').localeCompare(String(b.title || ''));
  });
}

function RepeaterField({ title, description, items, onAdd, onRemove, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p></div><ActionButton type="button" variant="neutral" onClick={onAdd}><Plus className="h-3.5 w-3.5" /> Add {title.replace(/s$/, '')}</ActionButton></div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => <div key={item._key || `${title}-${index}`} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/70 dark:bg-slate-900/60"><div className="mb-3 flex items-center justify-between gap-3"><span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{title.replace(/s$/, '')} {index + 1}</span><ActionButton type="button" variant="subtle" onClick={() => onRemove(index)} aria-label={`Remove ${title} ${index + 1}`}><Trash2 className="h-3.5 w-3.5" /></ActionButton></div>{children(item, index)}</div>)}
      </div>
    </div>
  );
}

function FileRecordCard({ file }) {
  const details = [
    ['Parent entity', file.parentEntity || 'plan'],
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
  return <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/60"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"><CalendarRange className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">{file.title || file.name || 'Plan file'}</p><p className="truncate text-xs text-slate-400">{file.name || 'Unnamed file'}</p></div></div><Badge tone="indigo">{file.mimeType || 'File'}</Badge></div><dl className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">{details.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{label}</dt><dd className="mt-1 break-all text-xs font-semibold text-slate-600 dark:text-slate-300">{String(value)}</dd></div>)}</dl></div>;
}

function PlanChain({ currentId, parentId, options }) {
  const map = planMap(options);
  const chain = [];
  let value = parentId ? String(parentId) : '';
  const visited = new Set();
  while (value && map.has(value) && !visited.has(value)) {
    visited.add(value);
    chain.unshift(map.get(value));
    value = map.get(value).parentPlan ? String(map.get(value).parentPlan) : '';
  }
  if (!chain.length) return <p className="text-xs text-slate-400">This is a top-level plan.</p>;
  return <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-300">{chain.map((plan, index) => <span key={plan._id} className="inline-flex items-center gap-1.5"><Badge tone={plan._id === currentId ? 'indigo' : 'slate'}>{plan.title || plan.slug}</Badge>{index < chain.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}</span>)}</div>;
}

export default function PlansAdmin() {
  const { can } = useAuth();
  const [items, setItems] = useState([]);
  const [planOptions, setPlanOptions] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingFileId, setRemovingFileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    const [plansResult, optionsResult, assigneeResult] = await Promise.allSettled([
      plansApi.list({ limit: 100 }),
      plansApi.options(),
      plansApi.assignees(),
    ]);
    if (plansResult.status === 'fulfilled') {
      setItems(plansResult.value.items || []);
      setError('');
    } else {
      setError(plansResult.reason?.response?.data?.error || 'Unable to load plans.');
    }
    if (optionsResult.status === 'fulfilled') setPlanOptions(optionsResult.value.items || []);
    if (assigneeResult.status === 'fulfilled') setAssignees(assigneeResult.value.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateForm = (updater) => setForm(updater);
  const set = (key) => (event) => updateForm((current) => ({ ...current, [key]: event.target.value }));
  const map = useMemo(() => planMap(items), [items]);
  const rows = useMemo(() => sortedPlanRows(items), [items]);
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((item) => !query || `${item.title} ${item.slug} ${item.period} ${item.year}`.toLowerCase().includes(query));
  }, [rows, search]);

  const engagement = useEngagement('plan', filteredItems.map((item) => item._id));

  const openCreate = () => {
    setError('');
    setForm(emptyForm());
  };

  const openEdit = (item) => {
    setError('');
    setForm(toForm(item));
  };

  const updateChecklist = (index, key, value) => updateForm((current) => ({ ...current, checklists: current.checklists.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const addChecklist = () => updateForm((current) => ({ ...current, checklists: [...current.checklists, { ...CHECKLIST_DEFAULT, _key: makeKey('checklist'), order: current.checklists.length }] }));
  const removeChecklist = (index) => updateForm((current) => ({ ...current, checklists: current.checklists.filter((_, itemIndex) => itemIndex !== index) }));
  const toggleAssignee = (id) => updateForm((current) => ({ ...current, assignedTo: current.assignedTo.includes(id) ? current.assignedTo.filter((item) => item !== id) : [...current.assignedTo, id] }));

  const changePeriod = (event) => {
    const period = event.target.value;
    updateForm((current) => ({ ...current, period, parentPlan: period === 'year' ? null : current.parentPlan, periodNumber: period === 'year' ? 1 : current.periodNumber || 1 }));
  };

  async function removeAttachment(file) {
    if (!window.confirm(`Remove “${file.name || 'this attachment'}” from the plan?`)) return;
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
    const { _id, attachments, attachmentMetadata, existingFiles, originalFiles, ...formValues } = form;
    delete formValues.createdAt;
    delete formValues.updatedAt;
    delete formValues.deletedAt;
    const payload = {
      ...formValues,
      slug: formValues.slug,
      title: formValues.title,
      visibility: formValues.visibility,
      period: formValues.period,
      year: formValues.year === '' ? undefined : Number(formValues.year),
      periodNumber: formValues.periodNumber === '' ? undefined : Number(formValues.periodNumber),
      parentPlan: formValues.parentPlan || null,
      description: formValues.description,
      goal: formValues.goal,
      target: formValues.target,
      checklists: cleanChecklists(formValues.checklists),
      startDate: formValues.startDate || null,
      endDate: formValues.endDate || null,
      assignedTo: formValues.assignedTo,
    };
    try {
      const result = _id ? await plansApi.update(_id, payload) : await plansApi.create(payload);
      const plan = result.plan;
      const originalById = new Map((originalFiles || []).map((file) => [file._id, file]));
      const changedFiles = (existingFiles || []).filter((file) => {
        const original = originalById.get(file._id);
        return original && ['order', 'title', 'alt'].some((key) => String(file[key] ?? '') !== String(original[key] ?? ''));
      });
      try {
        if (changedFiles.length > 0) await Promise.all(changedFiles.map((file) => filesApi.update(file._id, { order: Number(file.order) || 0, title: file.title || '', alt: file.alt || '' })));
        if (attachments.length > 0) await filesApi.uploadMany('plan', plan._id, attachments, undefined, attachmentMetadata);
      } catch (uploadError) {
        const completedFiles = new Set(uploadError.completedFiles || []);
        setForm((current) => ({ ...current, _id: plan._id, existingFiles: [...current.existingFiles, ...(uploadError.uploaded || [])], originalFiles: [...current.originalFiles, ...(uploadError.uploaded || [])], attachments: current.attachments.filter((file) => !completedFiles.has(file)), attachmentMetadata: current.attachmentMetadata.filter((_, index) => !completedFiles.has(current.attachments[index])) }));
        setError('Plan saved, but one or more file changes could not be saved. Try again.');
        return;
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}” and all of its child plans?`)) return;
    try {
      await plansApi.remove(item._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete plan.');
    }
  }

  const canCreate = can('plans', 'CREATE');
  const canUpdate = can('plans', 'UPDATE');
  const canDelete = can('plans', 'DELETE');
  const excludedParentIds = form?._id ? descendantIds(form._id, items) : new Set();
  if (form?._id) excludedParentIds.add(String(form._id));
  const parentOptions = planOptions.filter((option) => !excludedParentIds.has(String(option._id)));
  const childOptions = form?._id ? items.filter((item) => item.parentPlan && String(item.parentPlan) === String(form._id)) : [];

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="Workspace / Planning" title="Plans" description="Build connected goals, periods, checklists, ownership, and visibility from one place." actions={canCreate ? <ActionButton onClick={openCreate}><Plus className="h-4 w-4" /> New plan</ActionButton> : null} />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}

      <Modal open={!!viewing} onClose={() => setViewing(null)} eyebrow="Plan details" title={viewing?.title || 'Plan'} description="Complete record with hierarchy, checklists, assignees, and attached files.">
        {viewing && <div className="space-y-5">
          <ViewSection title="Overview" count={`${viewing.period || 'year'} ${viewing.year || ''}`.trim()}>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ViewField label="Slug" value={viewing.slug} />
              <ViewField label="Period" value={viewing.period} />
              <ViewField label="Year" value={viewing.year} />
              <ViewField label="Period number" value={viewing.periodNumber} />
              <ViewField label="Start date" value={toDateInput(viewing.startDate) || viewing.startDate} />
              <ViewField label="End date" value={toDateInput(viewing.endDate) || viewing.endDate} />
            </dl>
            <div className="mt-4"><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Visibility</p><div className="flex flex-wrap gap-1.5"><Badge tone="indigo">{VISIBILITY_LABELS[normalizeVisibilityValue(viewing.visibility)] || normalizeVisibilityValue(viewing.visibility)}</Badge></div></div>
          </ViewSection>
          <ViewSection title="Hierarchy" description="Ancestor chain resolved from the plan tree.">
            <PlanChain currentId={viewing._id} parentId={viewing.parentPlan} options={[...planOptions, ...items]} />
            <dl className="mt-4 grid gap-4 sm:grid-cols-2"><ViewField label="Parent plan ID" value={viewing.parentPlan} /><ViewField label="Child plans" value={(items.filter((item) => item.parentPlan && String(item.parentPlan) === String(viewing._id)).map((item) => item.title || item.slug)).join(', ') || 'None'} /></dl>
          </ViewSection>
          <ViewSection title="Assigned users" count={Array.isArray(viewing.assignedTo) ? viewing.assignedTo.length : 0}>
            <ViewList items={Array.isArray(viewing.assignedTo) ? viewing.assignedTo : []} empty="No users assigned.">
              {(user) => <dl className="grid gap-3 sm:grid-cols-3"><ViewField label="Name" value={refLabel(user)} /><ViewField label="Email" value={typeof user === 'object' ? user.email : undefined} /><ViewField label="Role" value={typeof user === 'object' ? user.role : undefined} /></dl>}
            </ViewList>
          </ViewSection>
          <ViewSection title="Intent">
            <dl className="grid gap-4"><ViewField label="Description" value={viewing.description} /><ViewField label="Goal" value={viewing.goal} /><ViewField label="Target" value={viewing.target} /></dl>
          </ViewSection>
          <ViewSection title="Checklists" description="Milestones tracked against this plan." count={(viewing.checklists || []).length}>
            <ViewList items={viewing.checklists || []} empty="No checklist items.">
              {(checklist) => <div><div className="flex flex-wrap items-center justify-between gap-3"><ViewField label="Title" value={checklist.title} /><Badge tone={checklist.status === 'completed' ? 'green' : checklist.status === 'failed' ? 'rose' : checklist.status === 'cancelled' ? 'slate' : 'amber'}>{checklist.status || 'pending'}</Badge></div><ViewField label="Description" value={checklist.description} /><dl className="mt-2 grid gap-3 sm:grid-cols-4"><ViewField label="Order" value={checklist.order} /><ViewField label="Created at" value={formatDate(checklist.createdAt)} /><ViewField label="Updated at" value={formatDate(checklist.updatedAt)} /><ViewField label="Deleted at" value={formatDate(checklist.deletedAt)} /></dl></div>}
            </ViewList>
          </ViewSection>
          <ViewSection title="Files" description="Assets linked to this plan." count={(viewing.files || []).length}>
            <ViewFiles files={viewing.files || []} parentEntity="plan" />
          </ViewSection>
          <ViewEngagement parentEntity="plan" parentId={viewing._id} className="space-y-4" />
          <ViewSection title="Record metadata">
            <ViewTimestamps createdAt={viewing.createdAt} updatedAt={viewing.updatedAt} deletedAt={viewing.deletedAt} extra={[["ID", viewing._id]]} />
          </ViewSection>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setViewing(null)}>Close</ActionButton>{canUpdate && <ActionButton type="button" onClick={() => { setError(''); setForm(toForm(viewing)); setViewing(null); }}><Pencil className="h-4 w-4" /> Edit plan</ActionButton>}</div>
        </div>}
      </Modal>

      <Modal open={!!form} onClose={() => !saving && setForm(null)} eyebrow={form?._id ? 'Editing plan' : 'New plan'} title={form?._id ? 'Refine plan structure' : 'Create a connected plan'} description="Every field is saved to the Plans schema, including hierarchy, checklists, ownership, and files.">
        {form && <form onSubmit={save}>
          <fieldset disabled={saving} className="space-y-6 border-0 p-0">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><Field label="Title" className="lg:col-span-2" required><TextInput value={form.title} onChange={set('title')} required autoFocus placeholder="2026 product roadmap" /></Field><Field label="Slug" hint="Leave blank to generate from title."><TextInput value={form.slug} onChange={set('slug')} placeholder="auto from title" /></Field><Field label="Period"><Select value={form.period} onChange={changePeriod} options={PERIODS} /></Field><Field label="Year"><TextInput type="number" value={form.year} onChange={set('year')} placeholder="2026" /></Field><Field label="Period number" hint="Whole number within the selected period."><TextInput type="number" min="1" step="1" value={form.periodNumber} onChange={set('periodNumber')} /></Field></div>

            <div className="rounded-2xl border border-indigo-100/80 bg-indigo-50/40 p-4 dark:border-violet-900/40 dark:bg-violet-950/20"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-violet-950 dark:text-violet-300"><Target className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Plan hierarchy</p><p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Year plans are top-level. Other periods can point to an active parent plan; cycles are rejected automatically.</p><div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><Field label="Parent plan"><Select value={form.parentPlan || ''} onChange={(event) => updateForm((current) => ({ ...current, parentPlan: event.target.value || null }))} disabled={form.period === 'year'} options={[{ value: '', label: 'No parent plan' }, ...parentOptions.map((option) => ({ value: option._id, label: `${option.title} · ${option.period}${option.year ? ` ${option.year}` : ''}` }))]} /></Field><div className="flex items-end"><div className="w-full rounded-xl border border-indigo-100 bg-white/70 px-3 py-2.5 text-xs text-slate-500 dark:border-violet-900/50 dark:bg-slate-900/60 dark:text-slate-400 md:w-64"><PlanChain currentId={form._id} parentId={form.parentPlan} options={[...planOptions, ...items]} /></div></div></div>{childOptions.length > 0 && <div className="mt-4 border-t border-indigo-100/70 pt-3 dark:border-violet-900/40"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Child plans</p><div className="mt-2 flex flex-wrap gap-2">{childOptions.map((child) => <Badge key={child._id} tone="indigo">{child.title}</Badge>)}</div></div>}</div></div></div>

            <div className="grid gap-5 md:grid-cols-2"><Field label="Description"><TextArea rows={4} value={form.description} onChange={set('description')} placeholder="What does this plan cover?" /></Field><Field label="Goal"><TextArea rows={4} value={form.goal} onChange={set('goal')} placeholder="The outcome this plan should achieve." /></Field><Field label="Target"><TextArea rows={3} value={form.target} onChange={set('target')} placeholder="A measurable target or destination." /></Field><Field label="Start date"><TextInput type="date" value={form.startDate} onChange={set('startDate')} /></Field><Field label="End date"><TextInput type="date" value={form.endDate} onChange={set('endDate')} /></Field></div>

            <div className="grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/30"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"><Users className="h-4 w-4" /></div><div><h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Visibility</h3><p className="mt-1 text-xs text-slate-400">Pick the lowest role that can view this plan. Higher roles can see it too.</p></div></div><div className="mt-4"><Select value={normalizeVisibilityValue(form.visibility)} onChange={(event) => updateForm((current) => ({ ...current, visibility: event.target.value }))} options={VISIBILITIES.map((visibility) => ({ value: visibility, label: VISIBILITY_LABELS[visibility] }))} /></div></div><div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/30"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300"><UserRound className="h-4 w-4" /></div><div><h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Assigned users</h3><p className="mt-1 text-xs text-slate-400">Assign one or more user IDs to this plan.</p></div></div><div className="mt-4 max-h-40 space-y-2 overflow-y-auto">{assignees.length > 0 ? assignees.map((user) => <label key={user._id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs dark:border-slate-800/70 dark:bg-slate-900/60"><input type="checkbox" checked={form.assignedTo.includes(String(user._id))} onChange={() => toggleAssignee(String(user._id))} className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800" /><span className="min-w-0"><span className="block truncate font-bold text-slate-700 dark:text-slate-200">{user.name}</span><span className="block truncate text-[10px] text-slate-400">{user.email} · {user.role}</span></span></label>) : <p className="text-xs text-slate-400">No assignable users returned.</p>}</div></div></div>

            <RepeaterField title="Checklists" description="Track milestones with title, description, status, order, and read-only checklist timestamps." items={form.checklists} onAdd={addChecklist} onRemove={removeChecklist}>
              {(checklist, index) => <div className="space-y-3"><div className="grid gap-3 md:grid-cols-[1fr_10rem_5rem]"><Field label="Title"><TextInput value={checklist.title || ''} onChange={(event) => updateChecklist(index, 'title', event.target.value)} placeholder="Milestone title" /></Field><Field label="Status"><Select value={checklist.status || 'pending'} onChange={(event) => updateChecklist(index, 'status', event.target.value)} options={CHECKLIST_STATUSES} /></Field><Field label="Order"><TextInput type="number" min="0" value={checklist.order ?? 0} onChange={(event) => updateChecklist(index, 'order', event.target.value === '' ? '' : Number(event.target.value))} /></Field></div><Field label="Description"><TextArea rows={2} value={checklist.description || ''} onChange={(event) => updateChecklist(index, 'description', event.target.value)} placeholder="What does completion look like?" /></Field><div className="grid gap-2 text-[10px] text-slate-400 sm:grid-cols-3"><span>Created: {formatDate(checklist.createdAt)}</span><span>Updated: {formatDate(checklist.updatedAt)}</span><span>Deleted: {formatDate(checklist.deletedAt)}</span></div></div>}
            </RepeaterField>

            <AttachmentField label="Plan files" hint="Upload images or supporting files. Set title, alt text, and order for each file." files={form.attachments} existingFiles={form.existingFiles} metadata={form.attachmentMetadata} onChange={(attachments) => updateForm((current) => ({ ...current, attachments }))} onMetadataChange={(attachmentMetadata) => updateForm((current) => ({ ...current, attachmentMetadata }))} onExistingChange={(existingFiles) => updateForm((current) => ({ ...current, existingFiles }))} onRemoveExisting={canDelete ? removeAttachment : undefined} showMetadata disabled={saving || !!removingFileId || !canUpdate} />
            <p className="text-[10px] leading-relaxed text-slate-400">Parent entity and ID, name, path, size, MIME type, uploader, and file timestamps are generated by the backend. Only order, title, and alt are editable.</p>
            {form.existingFiles.length > 0 && <div className="space-y-3 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><div><h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">File record details</h3><p className="mt-1 text-xs text-slate-400">Read-only values stored for each uploaded Plan file.</p></div>{form.existingFiles.map((file) => <FileRecordCard key={file._id} file={file} />)}</div>}

            <div className="grid gap-5 border-t border-slate-200/70 pt-5 md:grid-cols-3 dark:border-slate-800/70"><Field label="Created at"><TextInput disabled value={formatDate(form.createdAt)} /></Field><Field label="Updated at"><TextInput disabled value={formatDate(form.updatedAt)} /></Field><Field label="Deleted at"><TextInput disabled value={formatDate(form.deletedAt)} /></Field></div>
            <div className="flex justify-end gap-2 border-t border-slate-200/70 pt-5 dark:border-slate-800/70"><ActionButton type="button" variant="neutral" onClick={() => setForm(null)}>Cancel</ActionButton><ActionButton type="submit" loading={saving}>{saving ? 'Saving…' : form._id ? 'Save changes' : 'Create plan'}</ActionButton></div>
          </fieldset>
        </form>}
      </Modal>

      <AdminPanel className="overflow-hidden"><AdminToolbar><div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Plan hierarchy <span className="ml-1 text-xs font-medium text-slate-400">({filteredItems.length})</span></h2><p className="mt-1 text-xs text-slate-400">Years contain periods; periods can contain nested plans and checklists.</p></div><SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search plans…" className="w-full sm:w-64" /></AdminToolbar><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="bg-slate-50/80 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800/40"><tr><th className="px-4 py-3">Plan / hierarchy</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Visibility</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Files</th><th className="hidden px-4 py-3 2xl:table-cell">Engagement</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <LoadingRows rows={5} /> : filteredItems.map((item) => { const depth = planDepth(item, map); const parent = item.parentPlan ? map.get(String(item.parentPlan)) : null; return <tr key={item._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-4 py-4"><div className="flex items-center gap-3" style={{ paddingLeft: `${Math.min(depth, 5) * 18}px` }}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"><CalendarRange className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate font-bold text-slate-800 dark:text-slate-200">{item.title || 'Untitled plan'}</p><p className="truncate text-xs text-slate-400">{parent ? `Child of ${parent.title}` : item.slug || 'Top-level plan'}</p></div></div></td><td className="px-4 py-4"><Badge tone="slate" dot>{item.period} {item.year || ''}</Badge><p className="mt-1 text-[10px] text-slate-400">#{item.periodNumber ?? 1}</p></td><td className="px-4 py-4"><div className="flex flex-wrap gap-1"><Badge tone="indigo">{normalizeVisibilityValue(item.visibility)}</Badge></div></td><td className="px-4 py-4 text-xs text-slate-500">{Array.isArray(item.assignedTo) ? item.assignedTo.length : 0} users</td><td className="px-4 py-4 text-xs text-slate-500">{(item.files || []).length}</td><td className="hidden px-4 py-4 2xl:table-cell"><EngagementCell stats={engagementFor(engagement, item._id)} onClick={() => setViewing(item)} /></td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-1"><ActionButton variant="subtle" aria-label={`View ${item.title}`} onClick={() => setViewing(item)}><Eye className="h-4 w-4" /></ActionButton>{canUpdate && <ActionButton variant="subtle" aria-label={`Edit ${item.title}`} onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></ActionButton>}{canDelete && <ActionButton variant="subtle" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></ActionButton>}</div></td></tr>; })}{!loading && filteredItems.length === 0 && <TableEmpty colSpan={7} icon={CalendarRange} title={search ? 'No matching plans' : 'No plans yet'} description={search ? 'Try a different search term.' : 'Create your first plan to start building the hierarchy.'} />}</tbody></table></div></AdminPanel>
    </div>
  );
}
