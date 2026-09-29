import { useState } from 'react';
import confetti from 'canvas-confetti';
import { ChevronDown, Loader2, SendHorizonal, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { requestsApi } from '../api/requests.js';
import { Card, Field, Notice, TextArea, TextInput } from './ui.jsx';

const EMPTY = { message: '', requirements: '', minBudget: '', maxBudget: '', timeline: '' };

/**
 * Request form used both on a project page and on the projects index. Passing a
 * project scopes the request to that record; omitting it creates an open request.
 */
export default function ProjectRequest({
  project,
  title,
  description,
  submitLabel = 'Send request',
  idPrefix = 'request',
  className = '',
}) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [showDetails, setShowDetails] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const field = (name) => `${idPrefix}-${name}`;

  const heading = title || (project ? 'Request something like this' : 'Request a new project');
  const blurb = description || (
    project
      ? `Send a brief about what you want built. It lands against ${project.title} so the scope stays attached to the work.`
      : 'Tell me what you want built, from scratch or based on something already on this page. The more detail you give, the more useful the first reply will be.'
  );

  async function submit(event) {
    event.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    setStatus({ type: '', text: '' });
    try {
      await requestsApi.create({
        // Omitted on the index page, which creates a general request instead.
        project: project?._id,
        message: form.message.trim(),
        requirements: form.requirements.trim() || undefined,
        minBudget: form.minBudget === '' ? undefined : Number(form.minBudget),
        maxBudget: form.maxBudget === '' ? undefined : Number(form.maxBudget),
        // The admin view stores the timeline as a list of notes.
        timeline: form.timeline.trim()
          ? form.timeline.trim().split('\n').map((line) => line.trim()).filter(Boolean)
          : undefined,
      });
      setForm(EMPTY);
      setShowDetails(false);
      setStatus({ type: 'success', text: 'Request sent. You will hear back shortly.' });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.85 } });
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.error || 'Could not send the request. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card interactive={false} className={`p-6 sm:p-8 ${className}`}>
      <div className="flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 text-indigo-600 dark:text-violet-300">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{heading}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {blurb}
            {user ? '' : ' You can send this as a guest, but signing in links it to your account.'}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field id={field('message')} label="What do you need?" required>
          <TextArea
            id={field('message')}
            rows={3}
            value={form.message}
            onChange={set('message')}
            required
            placeholder="Describe the problem you want solved"
            className="resize-none"
          />
        </Field>

        {/* Budget and timeline are optional, so they stay collapsed until asked for. */}
        <div>
          <button
            type="button"
            onClick={() => setShowDetails((value) => !value)}
            aria-expanded={showDetails}
            aria-controls={field('details')}
            className="focus-ring inline-flex items-center gap-1.5 rounded text-xs font-bold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
            {showDetails ? 'Hide' : 'Add'} budget, requirements, and timeline
          </button>

          {showDetails && (
            <div id={field('details')} className="mt-4 space-y-4">
              <Field id={field('requirements')} label="Requirements" hint="Stack, integrations, constraints — anything that narrows the scope">
                <TextArea
                  id={field('requirements')}
                  rows={3}
                  value={form.requirements}
                  onChange={set('requirements')}
                  placeholder="e.g. Node + Postgres, deployed on Railway, must support offline drafts"
                  className="resize-none"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id={field('min-budget')} label="Min budget" hint="Optional">
                  <TextInput
                    id={field('min-budget')}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={form.minBudget}
                    onChange={set('minBudget')}
                    placeholder="Optional"
                  />
                </Field>
                <Field id={field('max-budget')} label="Max budget" hint="Optional">
                  <TextInput
                    id={field('max-budget')}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={form.maxBudget}
                    onChange={set('maxBudget')}
                    placeholder="Optional"
                  />
                </Field>
              </div>

              <Field id={field('timeline')} label="Timeline" hint="One milestone per line">
                <TextArea
                  id={field('timeline')}
                  rows={3}
                  value={form.timeline}
                  onChange={set('timeline')}
                  placeholder={'Design approved\nBeta deployed\nPublic launch'}
                  className="resize-none"
                />
              </Field>
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              {submitLabel}
              <SendHorizonal className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {status.text && (
        <Notice tone={status.type === 'success' ? 'success' : 'error'} className="mt-4">
          {status.text}
        </Notice>
      )}
    </Card>
  );
}
