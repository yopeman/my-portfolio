import { useMemo, useState } from 'react';
import { FolderGit2, Lightbulb, Sparkles } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectRequest from '../components/ProjectRequest.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard } from '../services/adapters.js';
import { EmptyState, Notice, PageHeader, SectionShell, Skeleton } from '../components/ui.jsx';

const FILTERS = {
  all: 'All work',
};

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { data, loading, error } = useAsyncResource(
    () => projectsApi.list({ limit: 100 }).then((r) => r.items),
    [],
  );

  const projects = (data || []).map(projectToCard);

  const categories = useMemo(() => {
    const seen = new Set();
    for (const project of projects) {
      if (project.type) seen.add(project.type);
    }
    return ['all', ...seen];
  }, [projects]);

  const counts = useMemo(() => {
    const map = { all: projects.length };
    for (const project of projects) {
      if (project.type) map[project.type] = (map[project.type] || 0) + 1;
    }
    return map;
  }, [projects]);

  const visibleProjects = activeFilter === 'all'
    ? projects
    : projects.filter((project) => project.type === activeFilter);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Portfolio"
        icon={FolderGit2}
        title="Ideas, built into"
        highlight="real products."
        description="A curated collection of experiments, platforms, and tools — each one shipped, documented, and doing something useful."
        meta={
          !loading && projects.length > 0 ? (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white">{visibleProjects.length}</span> of{' '}
              {projects.length} projects
            </p>
          ) : null
        }
      >
        {categories.length > 1 && (
          <div
            role="tablist"
            aria-label="Filter projects by type"
            className="mt-10 flex max-w-full gap-2 overflow-x-auto pb-2"
          >
            {categories.map((category) => {
              const selected = activeFilter === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveFilter(category)}
                  className={`focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition-all duration-300 ${
                    selected
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'border border-slate-200/70 bg-white/70 text-slate-600 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300'
                  }`}
                >
                  {FILTERS[category] || category}
                  <span className={`ml-1.5 ${selected ? 'opacity-70' : 'opacity-50'}`}>
                    {counts[category] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </PageHeader>

      <SectionShell size="wide" divider={false}>
        {error && (
          <Notice tone="error" className="mb-10" title="Projects unavailable">
            The project list could not be loaded from the database.
          </Notice>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading projects">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-[26rem]" />
            ))}
          </div>
        ) : visibleProjects.length > 0 ? (
          <AnimatedSection stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard key={project._id || project.slug} project={project} />
            ))}
          </AnimatedSection>
        ) : !error ? (
          <EmptyState
            icon={Sparkles}
            title={activeFilter === 'all' ? 'No projects published yet' : `Nothing in ${activeFilter} yet`}
            description={
              activeFilter === 'all'
                ? 'Projects added from the admin dashboard will appear here automatically.'
                : 'Try another filter, or clear the selection to see everything.'
            }
            action={
              activeFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className="btn-secondary"
                >
                  Show all work
                </button>
              ) : null
            }
          />
        ) : null}
      </SectionShell>

      <SectionShell id="request-a-project" size="narrow" tone="muted" divider={false}>
        <AnimatedSection>
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-fuchsia-500/15 text-amber-600 dark:text-amber-300">
              <Lightbulb className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Have a project in mind?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Describe it below and it lands straight in my inbox.
              </p>
            </div>
          </div>
          <ProjectRequest idPrefix="new-project" />
        </AnimatedSection>
      </SectionShell>
    </PublicLayout>
  );
}
