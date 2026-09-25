import SlideImage from './SlideImage';
import Projects from './Projects';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard } from '../services/adapters.js';

export default function ProjectsSection({ images = [] }) {
  const { data, loading, error } = useAsyncResource(
    () => projectsApi.list({ limit: 100 }).then((r) => r.items),
    []
  );
  const projects = (data || []).map(projectToCard);

  return (
    <section id="projects" className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`grid grid-cols-1 gap-12 items-start ${images.length ? 'lg:grid-cols-[1fr_2fr]' : ''}`}>
          {images.length > 0 && (
            <div className="hidden lg:block lg:sticky lg:top-24">
              <SlideImage
                images={images}
                className="w-full aspect-[3/4] shadow-2xl shadow-slate-900/10"
              />
              <div className="mt-6 space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Projects</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  A selection of things I've built — from AI platforms to distributed systems.
                </p>
              </div>
            </div>
          )}

          <div>
            <div className={`${images.length ? 'lg:hidden' : ''} mb-10 text-center`}>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Projects</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">A selection of things I've built.</p>
            </div>
            {error && (
              <p role="alert" className="mb-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                Unable to load projects from the database.
              </p>
            )}
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading projects…</p>
            ) : (
              <Projects projects={projects} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
