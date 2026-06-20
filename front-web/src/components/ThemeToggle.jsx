import { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

// Cycle: light → dark → night → light
const THEMES = ['light', 'dark', 'night'];

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'night');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'night') {
    root.classList.add('dark', 'night');
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('portfolio-theme');
    // If saved value is 'system' (legacy), default to 'light'
    if (saved && THEMES.includes(saved)) return saved;
    return 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  // Apply theme on mount immediately (handles page refresh)
  useEffect(() => {
    applyTheme(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative p-2.5 rounded-xl border transition-all duration-300 shadow-sm outline-none cursor-pointer
        bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900
        dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white
        night:bg-black night:border-purple-900/40 night:text-purple-400 night:hover:bg-purple-950/20 night:glow-purple"
      aria-label={`Switch theme (currently ${theme})`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {theme === 'light' && (
          <>
            <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span className="hidden sm:inline">Light</span>
          </>
        )}
        {theme === 'dark' && (
          <>
            <Moon className="w-4 h-4 text-violet-400" />
            <span className="hidden sm:inline">Dark</span>
          </>
        )}
        {theme === 'night' && (
          <>
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline text-purple-400">Night</span>
          </>
        )}
      </div>
    </button>
  );
}
