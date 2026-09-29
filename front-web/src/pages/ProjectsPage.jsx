import { useMemo, useState } from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectRequest from '../components/ProjectRequest.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard } from '../services/adapters.js';

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { data, loading, error } = useAsyncResource(
    () => projectsApi.list({ limit: 100 }).then((r) => r.items),
    [],
  );
  const projects = (data || []).map(projectToCard);
  const categories = useMemo(
    () => ['all', ...new Set(projects.map((project) => project.type).filter(Boolean))],
    [projects],
  );
  const visibleProjects = activeFilter === 'all'
    ? projects
    : projects.filter((project) => project.type === activeFilter);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10 ticks-bg">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl animate-morph" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl animate-float-slow" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <AnimatedSection className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-violet-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Selected work
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Ideas, built into <span className="text-gradient-primary">real products.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              A curated collection of experiments, platforms, and tools shaped by curiosity and a bias toward useful software.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={120} className="mt-10 flex flex-wrap items-center gap-3">
            <div role="tablist" aria-label="Filter projects" className="flex flex-wrap gap-2 rounded-2xl glass-subtle p-1.5">
              {categories.map((category) => {
                const count = category === 'all'
                  ? projects.length
                  : projects.filter((project) => project.type === category).length;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={activeFilter === category}
                    onClick={() => setActiveFilter(category)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition-all duration-300 ${activeFilter === category ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/70 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-violet-300'}`}
                  >
                    {category === 'all' ? 'All work' : category} <span className="ml-1 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
            <a href="#request-a-project" className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-violet-400">
              Have a project in mind?
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </AnimatedSection>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {error && (
            <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              Unable to load projects from the database.
            </p>
          )}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading projects">
              {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-shimmer rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />)}
            </div>
          ) : visibleProjects.length > 0 ? (
            <AnimatedSection stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id || project.slug} project={project} />
              ))}
            </AnimatedSection>
          ) : !error ? (
            <p className="rounded-2xl glass-subtle px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No projects in this category yet.</p>
          ) : null}
        </div>

        <div className="relative mx-auto max-w-3xl scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8" id="request-a-project">
          <AnimatedSection direction="up">
            <ProjectRequest idPrefix="new-project" />
          </AnimatedSection>
        </div>
      </section>
    </PublicLayout>
  );
}
