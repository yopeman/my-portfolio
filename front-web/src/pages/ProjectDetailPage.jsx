import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, ChevronRight, ExternalLink, Github } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { markdownComponents } from '../components/markdownComponents.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard, staticProjectsAsCards } from '../services/adapters.js';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { data } = useAsyncResource(
    () => projectsApi.bySlug(slug).then((r) => r.project),
    [slug]
  );

  const staticMatch = staticProjectsAsCards().find((p) => p.slug === slug);
  const project = data ? projectToCard(data) : staticMatch;

  const [imageIndex, setImageIndex] = useState(0);

  if (!project) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Project not found</h1>
          <Link to="/projects" className="mt-4 inline-block text-indigo-600 dark:text-violet-400 font-semibold">
            ← Back to projects
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const images = project.images || [];
  const stackList = project.stacks || project.tags.map((t, i) => ({ name: t, order: i }));

  return (
    <PublicLayout>
      <section className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <Link to="/projects" className="text-sm font-semibold text-indigo-600 dark:text-violet-400 hover:underline">
            ← Back to projects
          </Link>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {project.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {(project.tags || []).map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {images.length > 0 && (
            <div className="mt-8 relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center aspect-video max-h-[420px] group border border-slate-200/50 dark:border-slate-800">
              <img
                src={images[imageIndex]}
                alt={`${project.title} screenshot ${imageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                    aria-label="Previous screenshot"
                    className="absolute left-4 p-2 rounded-xl bg-slate-950/70 text-white hover:bg-slate-950 border border-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                    aria-label="Next screenshot"
                    className="absolute right-4 p-2 rounded-xl bg-slate-950/70 text-white hover:bg-slate-950 border border-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800/50">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImageIndex(idx)}
                        aria-label={`Screenshot ${idx + 1}`}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === imageIndex ? 'bg-indigo-500 scale-110' : 'bg-slate-500 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-10 space-y-8">
            {project.summary && (
              <div className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {project.summary}
              </div>
            )}

            {project.problem && (
              <div className="p-5 rounded-2xl bg-indigo-500/[0.04] dark:bg-violet-500/[0.04] border border-indigo-500/15 dark:border-violet-500/15">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400 mb-2">
                  What it solves
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{project.problem}</p>
              </div>
            )}

            {project.readme && (
              <div className="max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Description</h3>
                <ReactMarkdown components={markdownComponents}>{project.readme}</ReactMarkdown>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {stackList.map((stack, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                    >
                      {stack.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Links</h4>
                {project.repository && (
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-semibold transition-all"
                  >
                    <Github className="w-4 h-4" /> Github Repo
                  </a>
                )}
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
                  >
                    <ExternalLink className="w-4 h-4" /> Visit Website
                  </a>
                )}
              </div>
            </div>

            {project._id && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <ReactionBar parentEntity="project" parentId={project._id} />
                <FeedbackSection parentEntity="project" parentId={project._id} />
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}