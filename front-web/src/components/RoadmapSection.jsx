import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Target } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { plansApi } from '../api/plans.js';
import { ButtonLink, ProgressBar, SectionHeading, SectionShell, Skeleton } from './ui.jsx';

const PREVIEW_LIMIT = 3;

function progressOf(plan) {
  const items = plan.checklists || [];
  if (items.length === 0) return null;
  const done = items.filter((item) => item.status === 'completed').length;
  return { done, total: items.length, percent: Math.round((done / items.length) * 100) };
}

function periodLabel(plan) {
  return [plan.period, plan.periodNumber, plan.year].filter(Boolean).join(' ');
}

export default function RoadmapSection() {
  const { data, loading } = useAsyncResource(
    () => plansApi.list({ limit: PREVIEW_LIMIT }).then((response) => response.items || []),
    [],
  );

  const plans = (data || []).filter((plan) => !plan.parentPlan);
  if (!loading && plans.length === 0) return null;

  return (
    <SectionShell id="roadmap" size="wide">
      <AnimatedSection>
        <SectionHeading
          eyebrow="Roadmap"
          icon={Target}
          title="What I am working on next"
          description="Goals and checklists kept in the open, so the plan is honest about what is done and what is not."
        >
          <ButtonLink to="/plans" variant="secondary" size="sm" className="mt-6">
            See the full roadmap
          </ButtonLink>
        </SectionHeading>
      </AnimatedSection>

      <div className="mt-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3" aria-label="Loading plans">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-48" />
            ))}
          </div>
        ) : (
          <AnimatedSection stagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const progress = progressOf(plan);
              return (
                <article key={plan._id} className="card-surface card-surface-tight flex flex-col p-6">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    {periodLabel(plan)}
                  </p>
                  <h3 className="mt-2.5 text-lg font-extrabold leading-snug text-slate-900 dark:text-white">
                    {plan.title}
                  </h3>
                  {plan.description && (
                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {plan.description}
                    </p>
                  )}

                  {progress && (
                    <div className="mt-auto pt-6">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Progress
                        </span>
                        <span className="counter-value">
                          {progress.done}/{progress.total}
                        </span>
                      </div>
                      <ProgressBar value={progress.percent} label={`${plan.title} progress`} size="sm" />
                    </div>
                  )}

                  <Link
                    to="/plans"
                    className="focus-ring mt-5 inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 dark:text-violet-300"
                    aria-label={`View the roadmap for ${plan.title}`}
                  >
                    Details
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </AnimatedSection>
        )}
      </div>
    </SectionShell>
  );
}
