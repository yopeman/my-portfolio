import { Link } from 'react-router-dom';
import { Code, ExternalLink, Github } from 'lucide-react';

export default function Projects({ projects = [] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-800/40 night:border-purple-900/20 night:bg-black/40"
        >
          {/* Visual card header */}
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden border-b border-slate-100 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:border-slate-800/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            {project.images.length > 0 ? (
              <img
                src={project.images[0]}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-indigo-500/40 dark:text-indigo-400/30">
                <Code className="mb-2 h-12 w-12 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-mono text-xs uppercase tracking-wider">{project.folderName}</span>
              </div>
            )}
            {/* Subtle hover overlay */}
            <div className="pointer-events-none absolute inset-0 bg-slate-950/5 transition-colors duration-300 group-hover:bg-slate-950/0 dark:bg-slate-950/20" />
          </div>

          {/* Card Body */}
          <div className="flex flex-grow flex-col justify-between p-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 transition-colors duration-200 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-violet-400">
                {project.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                {project.summary}
              </p>
            </div>

            <div className="mt-6">
              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-slate-200/50 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-300 night:border-purple-900/10 night:bg-purple-950/20 night:text-purple-400"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2 py-0.5 text-xs font-medium text-slate-400">
                    +{project.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Quick Links. These sit above the card link so they stay clickable. */}
              <div className="relative z-10 flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 night:text-purple-400">
                {project.repository && (
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-violet-400"
                  >
                    <Github className="h-3.5 w-3.5" /> Repository
                  </a>
                )}
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-violet-400"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* The whole card is the link to the detail page, matching ProjectCard. */}
          <Link
            to={`/projects/${project.id}`}
            className="absolute inset-0 z-[1]"
            aria-label={`View ${project.title}`}
          >
            <span className="sr-only">View {project.title}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
