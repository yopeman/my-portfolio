import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SlideImage from './SlideImage';
import Projects from './Projects';
import AnimatedSection from './AnimatedSection';
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
            <AnimatedSection direction="up" className="hidden lg:block lg:sticky lg:top-24">
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
            </AnimatedSection>
          )}

          <div>
            <AnimatedSection direction="up" className={`${images.length ? 'lg:hidden' : ''} mb-10 ${!images.length ? 'text-center flex flex-col items-center' : 'text-center'}`}>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white relative inline-block">
                My Projects
                {!images.length && <div className="animated-underline mt-2 mx-auto" />}
              </h2>
              <p className="mt-4 text-slate-500 dark:text-slate-400">A selection of things I've built.</p>
              <Link to="/projects" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition-all duration-300 hover:-translate-y-0.5 hover:text-violet-500 dark:text-violet-400">
                Explore all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </AnimatedSection>

            {error && (
              <p role="alert" className="mb-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                Unable to load projects from the database.
              </p>
            )}

            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading projects…</p>
            ) : (
              <AnimatedSection stagger={true} className="stagger-children">
                <Projects projects={projects} />
              </AnimatedSection>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
