import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ListChecks, Target } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { plansApi } from '../api/plans.js';
import { ButtonLink, ProgressBar, SectionHeading, SectionLinkCard, SectionShell, Skeleton } from './ui.jsx';

function progressOf(plan) {
  const items = plan.checklists || [];
  if (items.length === 0) return null;
  const done = items.filter((item) => item.status === 'completed').length;
  return { done, total: items.length, percent: Math.round((done / items.length) * 100) };
}

function periodLabel(plan) {
  return [plan.period, plan.periodNumber, plan.year].filter(Boolean).join(' ');
}

export default function RoadmapSection({ showHeading = true, showSummary = true }) {
  const { data, loading } = useAsyncResource(
    () => plansApi.list({ limit: 100 }).then((response) => response.items || []),
    [],
  );

  // Root plans drive the preview. A plan whose parent is missing from the
  // response would otherwise vanish, taking the #plans anchor with it.
  const flat = data || [];
  const roots = flat.filter((plan) => !plan.parentPlan);
  const plans = roots.length ? roots : flat;
  if (!loading && flat.length === 0) return null;

  const checklists = plans.flatMap((plan) => plan.checklists || []);
  const completed = checklists.filter((item) => item.status === 'completed').length;
  const percent = checklists.length ? Math.round((completed / checklists.length) * 100) : 0;
  const periods = [...new Set(plans.map((plan) => plan.period).filter(Boolean))];

  return (
    <SectionShell id="plans" size="wide">
      {showHeading && (
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
      )}

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

      {showSummary && plans.length > 0 && (
        <AnimatedSection delay={120}>
          <SectionLinkCard
            icon={ListChecks}
            eyebrow="At a glance"
            title="The full roadmap"
            description="Every period with its nested plans, checklist status, and a discussion thread open for each one."
            to="/plans"
            linkLabel="Open the roadmap"
            facts={[
              { label: 'Plans', value: plans.length },
              { label: 'Checklists', value: checklists.length },
              { label: 'Done', value: `${percent}%` },
            ]}
          >
            {checklists.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <span>Overall completion</span>
                  <span className="counter-value">
                    {completed}/{checklists.length}
                  </span>
                </div>
                <ProgressBar value={percent} label="Overall roadmap completion" size="sm" />
              </div>
            )}
            {periods.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {periods.map((period) => (
                  <li
                    key={period}
                    className="rounded-full border border-slate-200/70 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 dark:border-slate-700/70 dark:text-slate-300"
                  >
                    {period}
                  </li>
                ))}
              </ul>
            )}
          </SectionLinkCard>
        </AnimatedSection>
      )}
    </SectionShell>
  );
}
