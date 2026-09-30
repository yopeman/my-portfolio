import { useState } from 'react';
import { Sparkles, Undo2, Wand2 } from 'lucide-react';
import { aiApi } from '../../api/ai.js';
import { ActionButton } from './form.jsx';

// Identities the backend relies on across a round trip. AboutAdmin keeps _id so
// sub-documents are updated instead of soft-deleted, and _key keeps React rows
// stable while the AI rewrites their contents.
const PRESERVED_KEYS = ['_id', '_key'];

// Only these keys travel to the model. Everything else in the form is either
// server managed (ids, timestamps) or binary (File objects) and must stay put.
const AI_FIELDS = {
  about: ['headline', 'bio', 'contacts', 'skills', 'educations', 'experiences'],
  project: ['name', 'summary', 'problem', 'solution', 'description', 'tags', 'type', 'features', 'stacks', 'links'],
  blog: ['title', 'excerpt', 'content', 'tags', 'type', 'status', 'links'],
};

function collectAiData(form, fields) {
  const data = {};
  for (const field of fields) {
    if (form[field] !== undefined) data[field] = form[field];
  }
  return data;
}

function stripIdentity(items) {
  return items.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const cleaned = {};
    for (const [key, value] of Object.entries(item)) {
      if (!PRESERVED_KEYS.includes(key)) cleaned[key] = value;
    }
    return cleaned;
  });
}

// _id and _key are per-row bookkeeping, not content, so the model never sees them.
function stripIdentityPayload(data) {
  const payload = {};
  for (const [field, value] of Object.entries(data)) {
    payload[field] = Array.isArray(value) ? stripIdentity(value) : value;
  }
  return payload;
}

function changedFields(before, after, fields) {
  return fields.filter((field) => {
    const a = JSON.stringify(before[field] ?? null);
    const b = JSON.stringify(after[field] ?? null);
    return a !== b;
  });
}

// The AI rewrites every array it returns, and it is required to keep the row
// order and length, so the identity of row N is carried over to row N.
function mergeEnhanced(current, patch, fields) {
  const next = { ...current };
  for (const field of fields) {
    if (!(field in patch)) continue;
    const incoming = patch[field];
    if (!Array.isArray(incoming)) {
      next[field] = incoming;
      continue;
    }
    const previous = Array.isArray(current[field]) ? current[field] : [];
    next[field] = incoming.map((item, index) => {
      const source = previous[index] || {};
      const identity = {};
      for (const key of PRESERVED_KEYS) {
        if (source[key] !== undefined) identity[key] = source[key];
      }
      return { ...(item || {}), ...identity };
    });
  }
  return next;
}

function humanize(field) {
  return field.charAt(0).toUpperCase() + field.slice(1);
}

export default function AiEnhanceBar({ entity, form, onChange, disabled = false }) {
  const fields = AI_FIELDS[entity] || [];
  const [instruction, setInstruction] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  // Hooks must run on every render, so the guard sits after them.
  if (!AI_FIELDS[entity]) return null;

  const isEmpty = fields.every((field) => {
    const value = form[field];
    if (Array.isArray(value)) return value.length === 0;
    return !String(value || '').trim();
  });

  async function enhance() {
    const before = collectAiData(form, fields);
    setBusy(true);
    setError('');
    try {
      const result = await aiApi.enhance({ entity, data: stripIdentityPayload(before), instruction });
      const changed = changedFields(before, result.data || {}, fields);
      if (changed.length === 0) {
        setReport('The AI had nothing to improve here. Add more detail and try again.');
        return;
      }
      setSnapshot(before);
      onChange(mergeEnhanced(form, result.data, fields));
      setReport(`Improved ${changed.map(humanize).join(', ')}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'The AI could not improve this form. Try again.');
    } finally {
      setBusy(false);
    }
  }

  function undo() {
    if (!snapshot) return;
    onChange(mergeEnhanced(form, snapshot, fields));
    setSnapshot(null);
    setReport('Reverted to your version.');
  }

  return (
    <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/80 to-indigo-50/60 p-4 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-indigo-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
            <Sparkles className="h-3 w-3" /> AI writer
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Rewrites this form in place for clarity and detail. Nothing is saved until you press save, and your facts are never replaced with invented ones.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {snapshot && (
            <ActionButton type="button" variant="neutral" onClick={undo} disabled={busy || disabled}>
              <Undo2 className="h-3.5 w-3.5" /> Undo
            </ActionButton>
          )}
          <ActionButton type="button" onClick={enhance} loading={busy} disabled={disabled || isEmpty}>
            {!busy && <Wand2 className="h-3.5 w-3.5" />} {busy ? 'Improving…' : 'Improve with AI'}
          </ActionButton>
        </div>
      </div>

      <div className="mt-3">
        <input
          type="text"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          disabled={busy || disabled}
          placeholder="Optional: focus the rewrite, e.g. “make the bio sound more concise”"
          className="w-full rounded-xl border border-violet-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-900/60 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500"
        />
      </div>

      {isEmpty && <p className="mt-2.5 text-xs text-slate-400">Fill in at least one field first.</p>}
      {report && <p className="mt-2.5 text-xs font-semibold text-violet-600 dark:text-violet-300">{report}</p>}
      {error && <p role="alert" className="mt-2.5 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  );
}
