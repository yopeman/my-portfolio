import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange, CheckCircle2, Circle, MessagesSquare, Target, XCircle } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { plansApi } from '../api/plans.js';

const PERIOD_ORDER = ['year', 'half', 'quarter', 'month', 'week', 'day'];

const STATUS_STYLES = {
  completed: { icon: CheckCircle2, className: 'text-emerald-500' },
  failed: { icon: XCircle, className: 'text-rose-500' },
  cancelled: { icon: XCircle, className: 'text-slate-300 dark:text-slate-600' },
  'in progress': { icon: Target, className: 'text-amber-500' },
  pending: { icon: Circle, className: 'text-slate-300 dark:text-slate-600' },
};

function buildTree(plans) {
  const byId = new Map(plans.map((plan) => [String(plan._id), { ...plan, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    const parent = node.parentPlan ? byId.get(String(node.parentPlan)) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sort = (nodes) => {
    nodes.sort((a, b) => (b.year || 0) - (a.year || 0) || PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period) || (a.periodNumber || 1) - (b.periodNumber || 1));
    nodes.forEach((node) => sort(node.children));
    return nodes;
  };
  return sort(roots);
}

function progressOf(plan) {
  const items = plan.checklists || [];
  if (items.length === 0) return null;
  const done = items.filter((item) => item.status === 'completed').length;
  return { done, total: items.length, percent: Math.round((done / items.length) * 100) };
}

function PlanNode({ plan, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0);
  // Discussion is opt-in per plan, so fetching stays off the default render path.
  const [discussing, setDiscussing] = useState(false);
  const progress = progressOf(plan);
  const checklists = plan.checklists || [];
  const hasChildren = plan.children.length > 0;

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-slate-200/80 pl-4 sm:ml-6 sm:pl-6 dark:border-slate-800' : ''}>
      <article className="rounded-2xl glass-subtle p-5 shadow-sm transition-all duration-500 hover:border-indigo-300/70 hover:shadow-lg hover:shadow-indigo-500/10 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5" />
                {plan.period}{plan.periodNumber ? ` ${plan.periodNumber}` : ''}{plan.year ? ` · ${plan.year}` : ''}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">{plan.title}</h3>
            {plan.description && <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{plan.description}</p>}
            {(plan.goal || plan.target) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.goal && <span className="rounded-lg border border-indigo-200/70 bg-indigo-50/60 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">Goal: {plan.goal}</span>}
                {plan.target && <span className="rounded-lg border border-emerald-200/70 bg-emerald-50/60 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">Target: {plan.target}</span>}
              </div>
            )}
          </div>
          {progress && (
            <div className="w-full shrink-0 sm:w-40">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Progress</span>
                <span>{progress.done}/{progress.total}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          )}
        </div>

        {checklists.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            {checklists.map((item) => {
              const style = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
              const Icon = style.icon;
              return (
                <li key={item._id} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.className}`} />
                  <span className={item.status === 'completed' ? 'line-through opacity-60' : ''}>{item.title || 'Untitled item'}</span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          {hasChildren && (
            <button type="button" onClick={() => setOpen((value) => !value)} className="text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-violet-400">
              {open ? 'Hide' : 'Show'} {plan.children.length} nested plan{plan.children.length > 1 ? 's' : ''}
            </button>
          )}
          <button
            type="button"
            onClick={() => setDiscussing((value) => !value)}
            aria-expanded={discussing}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-400"
          >
            <MessagesSquare className="h-3.5 w-3.5" />
            {discussing ? 'Hide discussion' : 'Discuss this plan'}
          </button>
        </div>

        {discussing && (
          <div className="mt-4">
            <ReactionBar parentEntity="plan" parentId={plan._id} />
            <div className="mt-6">
              <FeedbackSection parentEntity="plan" parentId={plan._id} />
            </div>
          </div>
        )}
      </article>

      {hasChildren && open && (
        <div className="mt-3 space-y-3">
          {plan.children.map((child) => <PlanNode key={child._id} plan={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function PlansPage() {
  const { data, loading, error } = useAsyncResource(
    () => plansApi.list({ limit: 100 }).then((response) => response.items || []),
    [],
  );
  const plans = useMemo(() => buildTree(data || []), [data]);
  const totals = useMemo(() => {
    const flat = data || [];
    const checklists = flat.flatMap((plan) => plan.checklists || []);
    return {
      plans: flat.length,
      completed: checklists.filter((item) => item.status === 'completed').length,
      checklists: checklists.length,
    };
  }, [data]);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10 ticks-bg">
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl animate-morph" />
        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <AnimatedSection className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-violet-400">
              <Target className="h-3.5 w-3.5" />
              Roadmap
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Plans that keep <span className="text-gradient-primary">work honest.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Goals, periods, and checklists laid out in the open. Expand a period to see the milestones underneath it.
            </p>
            {totals.plans > 0 && (
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                <span>{totals.plans} plans</span>
                <span>{totals.checklists} checklist items</span>
                <span>{totals.completed} completed</span>
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {error && (
          <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
            Unable to load plans from the database.
          </p>
        )}
        {loading ? (
          <div className="space-y-4" aria-label="Loading plans">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-44 animate-shimmer rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />)}
          </div>
        ) : plans.length > 0 ? (
          <AnimatedSection stagger className="space-y-4">
            {plans.map((plan) => <PlanNode key={plan._id} plan={plan} />)}
          </AnimatedSection>
        ) : !error ? (
          <p className="rounded-2xl glass-subtle px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No plans published yet.</p>
        ) : null}
        <div className="mt-12 text-center">
          <Link to="/#contact" className="text-sm font-semibold text-indigo-600 dark:text-violet-400">Want to walk through any of these? Get in touch →</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
