import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, ExternalLink, Github } from 'lucide-react';
import { Chip } from './ui.jsx';

const MAX_TAGS = 3;

export default function ProjectCard({ project, compact = false }) {
  const { slug, title, summary, tags = [], images = [], folderName, repository, website } = project;
  const cover = images[0];

  return (
    <article className="card-surface card-surface-tight group relative flex h-full flex-col overflow-hidden">
      <div className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden border-b border-slate-200/60 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-fuchsia-500/10 dark:border-slate-800/70 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-fuchsia-950/30">
        {cover ? (
          <img
            src={cover}
            alt={`${title} preview`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-indigo-500/50 dark:text-violet-300/40">
            <Code2 className="h-10 w-10 transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
            <span className="max-w-[85%] truncate font-mono text-[10px] uppercase tracking-wider">
              {folderName || title}
            </span>
          </div>
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />
        {project.type && (
          <span className="absolute left-3 top-3">
            <Chip tone="accent" className="backdrop-blur-md">
              {project.type}
            </Chip>
          </span>
        )}
      </div>

      <div className="relative z-[2] flex flex-1 flex-col p-6">
        <h3 className="text-lg font-extrabold leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-violet-300">
          {title}
        </h3>
        {summary && (
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {summary}
          </p>
        )}

        {tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {tags.slice(0, compact ? 2 : MAX_TAGS).map((tag) => (
              <li key={tag}>
                <Chip>{tag}</Chip>
              </li>
            ))}
            {tags.length > (compact ? 2 : MAX_TAGS) && (
              <li>
                <span className="px-2 py-1 text-xs font-semibold text-slate-400">
                  +{tags.length - (compact ? 2 : MAX_TAGS)} more
                </span>
              </li>
            )}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            {repository && (
              <a
                href={repository}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${title} repository on GitHub`}
                className="focus-ring inline-flex items-center gap-1.5 rounded text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300"
              >
                <Github className="h-3.5 w-3.5" aria-hidden="true" />
                Code
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${title} live demo`}
                className="focus-ring inline-flex items-center gap-1.5 rounded text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Live
              </a>
            )}
          </div>

          <span
            className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-violet-300"
            aria-hidden="true"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* The whole card navigates. External links sit above it via z-index. */}
      <Link
        to={`/projects/${slug}`}
        className="focus-ring absolute inset-0 z-[1] rounded-2xl"
        aria-label={`View ${title}`}
      >
        <span className="sr-only">View {title}</span>
      </Link>
    </article>
  );
}
