import { Link } from 'react-router-dom';
import { ExternalLink, Github, Code, ArrowRight } from 'lucide-react';
import { useState, useRef } from 'react';

export default function ProjectCard({ project }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('');
  };

  return (
    <div
      ref={cardRef}
      className="card-3d transition-transform duration-300 ease-out h-full"
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={`/projects/${project.slug || project.id}`}
        className="group flex flex-col h-full bg-white dark:bg-slate-800/40 night:bg-black/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 night:border-purple-900/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden relative gradient-border"
      >
        <div className="h-48 w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
          {project.images?.length > 0 ? (
            <>
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
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
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-violet-400 dark:group-hover:to-fuchsia-400 transition-colors duration-200">
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
                  className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800/80 night:bg-purple-950/20 text-slate-600 dark:text-slate-300 night:text-purple-400 border border-slate-200/50 dark:border-slate-700/50 night:border-purple-900/10 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-violet-900/50 dark:hover:text-violet-300 transition-colors"
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

            <div className="flex items-center justify-between">
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
              <div className="flex items-center text-sm font-semibold text-indigo-600 dark:text-violet-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <span className="mr-1">View</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}