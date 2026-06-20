import { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portfolio-theme') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Resolve theme setting
    let activeTheme = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'light';
    }

    // Apply class names
    if (activeTheme === 'light') {
      root.classList.remove('dark', 'night');
    } else if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('night');
    } else if (activeTheme === 'night') {
      root.classList.add('dark', 'night');
    }

    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  // Listen for system preference changes if theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
        root.classList.remove('night');
      } else {
        root.classList.remove('dark', 'night');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('night');
    } else {
      setTheme('light');
    }
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
