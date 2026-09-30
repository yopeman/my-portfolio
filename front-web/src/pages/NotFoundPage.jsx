import { Compass, Home, PenLine, FolderGit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import { ButtonLink, Container } from '../components/ui.jsx';

const SUGGESTIONS = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Projects', to: '/projects', icon: FolderGit2 },
  { label: 'Blog', to: '/blogs', icon: PenLine },
];

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="relative isolate">
        <div className="mesh-hero absolute inset-0 -z-10" />
        <div className="grid-fade absolute inset-0 -z-10" />

        <Container size="narrow" className="flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
          <span className="animate-pop flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 text-indigo-500 dark:text-violet-300">
            <Compass className="h-8 w-8" aria-hidden="true" />
          </span>

          <p className="eyebrow mt-8">Error 404</p>
          <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            This page went{' '}
            <span className="text-gradient-primary">off the map</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            The address you followed does not match anything on this site. It may have been moved, renamed, or never existed.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink to="/" variant="primary" icon={Home}>
              Back to home
            </ButtonLink>
            <ButtonLink to="/projects" variant="secondary" icon={FolderGit2}>
              Browse projects
            </ButtonLink>
          </div>

          <nav aria-label="Suggested pages" className="mt-12 border-t border-slate-200/70 pt-6 dark:border-slate-800/70">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {SUGGESTIONS.map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="focus-ring link-underline inline-flex items-center gap-1.5 rounded text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>
    </PublicLayout>
  );
}
