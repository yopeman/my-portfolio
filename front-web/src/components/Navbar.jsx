import { Terminal } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-slate-200/40 dark:border-slate-800/40 night:border-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-violet-600 night:bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            Y
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-md tracking-tight group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-colors">
            Yohanes.dev
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#about" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">About</a>
          <a href="#skills" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Skills</a>
          <a href="#projects" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Projects</a>
          <a href="#contact" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a href="#contact" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-violet-600 dark:hover:bg-violet-500 night:bg-purple-600 night:hover:bg-purple-500 transition-colors cursor-pointer">
            Hire Me
          </a>
        </div>
      </div>
    </header>
  );
}