import PublicLayout from '../components/PublicLayout.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard, staticProjectsAsCards } from '../services/adapters.js';

export default function ProjectsPage() {
  const { data, loading } = useAsyncResource(
    () => projectsApi.list({ limit: 100 }).then((r) => r.items),
    []
  );
  const cards = data?.length ? data.map(projectToCard) : staticProjectsAsCards();

  return (
    <PublicLayout>
      <section className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Projects
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              {loading && !data ? 'Loading…' : 'A selection of things I’ve built — from AI platforms to distributed systems.'}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((project) => (
              <ProjectCard key={project.id || project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}