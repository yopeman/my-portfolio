import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Circle,
  MessagesSquare,
  Target,
  XCircle,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { plansApi } from '../api/plans.js';
import { Card, Chip, EmptyState, Notice, PageHeader, ProgressBar, SectionShell, Skeleton } from '../components/ui.jsx';

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
    nodes.sort(
      (a, b) =>
        (b.year || 0) - (a.year || 0) ||
        PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period) ||
        (a.periodNumber || 1) - (b.periodNumber || 1),
    );
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

function periodLabel(plan) {
  return [plan.period, plan.periodNumber, plan.year].filter(Boolean).join(' ');
}

function PlanNode({ plan, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth === 0);
  // Discussion is opt-in per plan, so fetching stays off the default render path.
  const [discussing, setDiscussing] = useState(false);
  const progress = progressOf(plan);
  const checklists = plan.checklists || [];
  const hasChildren = plan.children.length > 0;

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-slate-200/80 pl-4 sm:ml-6 sm:pl-6 dark:border-slate-800' : ''}>
      <Card interactive={false} className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
              {periodLabel(plan)}
            </p>
            <h3 className="mt-2.5 text-lg font-extrabold leading-snug text-slate-900 dark:text-white">{plan.title}</h3>
            {plan.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{plan.description}</p>
            )}
            {(plan.goal || plan.target) && (
              <ul className="mt-3.5 flex flex-wrap gap-2">
                {plan.goal && (
                  <li>
                    <Chip tone="accent">Goal: {plan.goal}</Chip>
                  </li>
                )}
                {plan.target && (
                  <li>
                    <Chip tone="emerald">Target: {plan.target}</Chip>
                  </li>
                )}
              </ul>
            )}
          </div>

          {progress && (
            <div className="w-full shrink-0 sm:w-44">
              <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>Progress</span>
                <span className="counter-value">
                  {progress.done}/{progress.total}
                </span>
              </div>
              <ProgressBar value={progress.percent} label={`${plan.title} progress`} />
            </div>
          )}
        </div>

        {checklists.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
            {checklists.map((item) => {
              const style = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
              const Icon = style.icon;
              const done = item.status === 'completed';
              return (
                <li key={item._id} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.className}`} aria-hidden="true" />
                  <span className={done ? 'line-through opacity-60' : ''}>
                    {item.title || 'Untitled item'}
                    {done && <span className="sr-only"> (completed)</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
          {hasChildren && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="focus-ring inline-flex items-center gap-1.5 rounded text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-violet-300"
            >
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
              {expanded ? 'Hide' : 'Show'} {plan.children.length} nested plan
              {plan.children.length > 1 ? 's' : ''}
            </button>
          )}
          <button
            type="button"
            onClick={() => setDiscussing((value) => !value)}
            aria-expanded={discussing}
            className="focus-ring inline-flex items-center gap-1.5 rounded text-xs font-bold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300"
          >
            <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />
            {discussing ? 'Hide discussion' : 'Discuss this plan'}
          </button>
        </div>

        {discussing && (
          <div className="mt-5 border-t border-slate-200/60 pt-5 dark:border-slate-800/60">
            <ReactionBar parentEntity="plan" parentId={plan._id} />
            <FeedbackSection parentEntity="plan" parentId={plan._id} />
          </div>
        )}
      </Card>

      {hasChildren && expanded && (
        <div className="mt-4 space-y-4">
          {plan.children.map((child) => (
            <PlanNode key={child._id} plan={child} depth={depth + 1} />
          ))}
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
      <PageHeader
        eyebrow="Roadmap"
        icon={Target}
        title="Plans that keep"
        highlight="work honest."
        description="Goals, periods, and checklists laid out in the open. Expand a period to see the milestones underneath it."
        meta={
          totals.plans > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <Chip tone="accent">{totals.plans} plans</Chip>
              <Chip>{totals.checklists} checklist items</Chip>
              <Chip tone="emerald">{totals.completed} completed</Chip>
            </div>
          ) : null
        }
      />

      <SectionShell size="wide" divider={false}>
        {error && (
          <Notice tone="error" className="mb-10" title="Roadmap unavailable">
            The plan list could not be loaded from the database.
          </Notice>
        )}

        {loading ? (
          <div className="space-y-5" aria-label="Loading plans">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-52" />
            ))}
          </div>
        ) : plans.length > 0 ? (
          <AnimatedSection stagger className="space-y-5">
            {plans.map((plan) => (
              <PlanNode key={plan._id} plan={plan} />
            ))}
          </AnimatedSection>
        ) : !error ? (
          <EmptyState
            icon={Target}
            title="No plans published yet"
            description="Goals and checklists created in the admin dashboard will show up here."
          />
        ) : null}

        <p className="mt-14 text-center text-sm text-slate-500 dark:text-slate-400">
          Want to walk through any of these?{' '}
          <Link
            to="/#contact"
            className="link-underline font-bold text-indigo-600 dark:text-violet-300"
          >
            Get in touch
          </Link>
          .
        </p>
      </SectionShell>
    </PublicLayout>
  );
}
