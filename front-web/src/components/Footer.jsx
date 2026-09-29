import { ArrowUp, Github, Linkedin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './ui.jsx';

const SOCIALS = [
  { name: 'GitHub', href: 'https://github.com/yopeman', icon: Github },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/yohanes-debebe-71a93136b', icon: Linkedin },
  { name: 'Telegram', href: 'https://t.me/yope_man', icon: Send },
];

// Mirrors the navbar: every link jumps to a home-page section, and each
// section carries its own link through to the full page.
const SECTIONS = [
  { name: 'About', to: '/#about' },
  { name: 'Skills', to: '/#skills' },
  { name: 'Experience', to: '/#experience' },
  { name: 'Projects', to: '/#projects' },
  { name: 'Blog', to: '/#blogs' },
  { name: 'Plans', to: '/#plans' },
  { name: 'Contact', to: '/#contact' },
  { name: 'Feedback', to: '/#feedback' },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-slate-200/60 dark:border-slate-800/60 night:border-purple-900/10">
      <div className="mesh-muted pointer-events-none absolute inset-0 -z-10" />
      <div
        className="animate-shimmer absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
        aria-hidden="true"
      />

      <Container size="wide" className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="focus-ring group inline-flex items-center gap-2.5 rounded-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-base font-black text-white transition-transform duration-300 group-hover:scale-110">
                Y
              </span>
              <span className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                Yohanes Debebe
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Software developer building dependable backend systems, AI workflows, and interfaces that stay out of the way.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-violet-500/50 dark:hover:text-violet-300"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Sections</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {SECTIONS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="focus-ring link-underline rounded text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Elsewhere</h2>
            <ul className="mt-4 space-y-2.5">
              {SOCIALS.map(({ name, href }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring link-underline inline-flex items-center gap-1.5 rounded text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300"
                  >
                    {name}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Yohanes Debebe. All rights reserved.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-6 sm:flex-row dark:border-slate-800/60">
          <p className="text-center text-xs text-slate-400 sm:text-left">
            Built with React, Express, and MongoDB. Content is loaded from the database — no static fallbacks.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="focus-ring group inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
          </button>
        </div>
      </Container>
    </footer>
  );
}
