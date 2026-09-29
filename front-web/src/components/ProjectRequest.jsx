import { useState } from 'react';
import confetti from 'canvas-confetti';
import { AlertCircle, Check, Loader2, SendHorizonal, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { requestsApi } from '../api/requests.js';

const EMPTY = { message: '', requirements: '', minBudget: '', maxBudget: '', timeline: '' };

const inputClass = 'w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white/80 dark:bg-slate-800/80 night:bg-black/80 dark:text-white night:border-purple-900/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300';

export default function ProjectRequest({ project }) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    setStatus({ type: '', text: '' });
    try {
      await requestsApi.create({
        // The request is scoped to this project so staff can triage it against
        // the work it refers to.
        project: project._id,
        message: form.message.trim(),
        requirements: form.requirements.trim() || undefined,
        minBudget: form.minBudget === '' ? undefined : Number(form.minBudget),
        maxBudget: form.maxBudget === '' ? undefined : Number(form.maxBudget),
        // The admin view stores the timeline as a list of notes.
        timeline: form.timeline.trim() ? form.timeline.trim().split('\n').map((line) => line.trim()).filter(Boolean) : undefined,
      });
      setForm(EMPTY);
      setStatus({ type: 'success', text: 'Request sent. You will hear back about this project shortly.' });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.85 } });
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.error || 'Could not send the request. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-indigo-500/15 bg-indigo-500/[0.04] p-6 sm:p-8 dark:border-violet-500/15 dark:bg-violet-500/[0.04]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-violet-950 dark:text-violet-300">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Request something like this</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Send a brief about what you want built. It lands against {project.title} so the scope stays attached to the work.
            {user ? '' : ' You can send this as a guest, but signing in links it to your account.'}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="request-message" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">What do you need?</label>
          <textarea id="request-message" rows={3} value={form.message} onChange={set('message')} required placeholder="Describe the problem you want solved" className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label htmlFor="request-requirements" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Requirements</label>
          <textarea id="request-requirements" rows={3} value={form.requirements} onChange={set('requirements')} placeholder="Stack, integrations, constraints — anything that narrows the scope" className={`${inputClass} resize-none`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="request-min-budget" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Min budget</label>
            <input id="request-min-budget" type="number" min="0" step="1" value={form.minBudget} onChange={set('minBudget')} placeholder="Optional" className={inputClass} />
          </div>
          <div>
            <label htmlFor="request-max-budget" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Max budget</label>
            <input id="request-max-budget" type="number" min="0" step="1" value={form.maxBudget} onChange={set('maxBudget')} placeholder="Optional" className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="request-timeline" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Timeline</label>
          <textarea id="request-timeline" rows={2} value={form.timeline} onChange={set('timeline')} placeholder="One milestone per line" className={`${inputClass} resize-none`} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all duration-300 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
        >
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>Send request <SendHorizonal className="h-4 w-4" /></>}
        </button>
      </form>

      {status.text && (
        <div className={`mt-4 flex items-start gap-2.5 rounded-xl border p-4 text-sm font-semibold ${status.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/35 dark:bg-emerald-950/20 dark:text-emerald-400'
          : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/35 dark:bg-rose-950/20 dark:text-rose-400'
        }`}>
          {status.type === 'success'
            ? <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />}
          <span className="leading-relaxed">{status.text}</span>
        </div>
      )}
    </section>
  );
}
