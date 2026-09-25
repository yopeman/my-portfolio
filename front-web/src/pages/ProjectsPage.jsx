import PublicLayout from '../components/PublicLayout.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard } from '../services/adapters.js';

export default function ProjectsPage() {
  const { data, loading, error } = useAsyncResource(
    () => projectsApi.list({ limit: 100 }).then((r) => r.items),
    []
  );
  const projects = (data || []).map(projectToCard);

  return (
    <PublicLayout>
      <section className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Projects
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              A selection of things I’ve built — from AI platforms to distributed systems.
            </p>
          </div>
          {error && (
            <p role="alert" className="mt-8 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              Unable to load projects from the database.
            </p>
          )}
          {loading ? (
            <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">Loading projects…</p>
          ) : projects.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id || project.slug} project={project} />
              ))}
            </div>
          ) : !error ? (
            <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">No projects available.</p>
          ) : null}
        </div>
      </section>
    </PublicLayout>
  );
}
