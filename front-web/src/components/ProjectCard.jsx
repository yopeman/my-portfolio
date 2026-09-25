import { Link } from 'react-router-dom';
import { ExternalLink, Github, Code } from 'lucide-react';

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.slug || project.id}`}
      className="group flex flex-col h-full bg-white dark:bg-slate-800/40 night:bg-black/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 night:border-purple-900/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative"
    >
      <div className="h-48 w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
        {project.images?.length > 0 ? (
          <img
            src={project.images[0]}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-indigo-500/40 dark:text-indigo-400/30">
            <Code className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs font-mono tracking-wider uppercase">{project.folderName || project.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-slate-950/5 dark:bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors duration-300" />
      </div>

      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-colors duration-200">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
            {project.summary}
          </p>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(project.tags || []).slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800/80 night:bg-purple-950/20 text-slate-600 dark:text-slate-300 night:text-purple-400 border border-slate-200/50 dark:border-slate-700/50 night:border-purple-900/10"
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

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 night:text-purple-400">
            {project.repository && (
              <a
                href={project.repository}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-violet-400"
              >
                <Github className="w-3.5 h-3.5" /> Repository
              </a>
            )}
            {project.website && (
              <a
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-violet-400"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}