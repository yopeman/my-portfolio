import { Github, Linkedin, Send, ArrowUp } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-10 mt-12 border-t border-slate-200/30 dark:border-slate-800/30 bg-slate-50/50 dark:bg-slate-900/50 night:bg-black/50 glass-subtle text-center text-xs text-slate-400 overflow-hidden">
      {/* Gradient shimmer divider */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-shimmer"></div>

      <AnimatedSection direction="up" threshold={0.1}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="font-semibold text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Yohanes Debebe. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/yopeman" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white hover:scale-110 hover:glow-accent transition-all duration-300">
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/yohanes-debebe-71a93136b" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white hover:scale-110 hover:glow-accent transition-all duration-300">
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <a href="https://t.me/yope_man" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white hover:scale-110 hover:glow-accent transition-all duration-300">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Telegram</span>
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="hidden sm:flex items-center justify-center p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none hover:-translate-y-1 duration-300"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </AnimatedSection>
    </footer>
  );
}