import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Sparkles, Monitor } from 'lucide-react';

// Cycle: light → dark → night → system → light
const THEMES = ['light', 'dark', 'night', 'system'];

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'night');

  const resolved = theme === 'system' ? getSystemPreference() : theme;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'night') {
    root.classList.add('dark', 'night');
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved && THEMES.includes(saved)) return saved;
    return 'system';
  });

  const mediaQueryRef = useRef(null);
  const handlerRef = useRef(null);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  // Listen to OS preference changes only when in system mode
  useEffect(() => {
    // Clean up any previous listener
    if (mediaQueryRef.current && handlerRef.current) {
      mediaQueryRef.current.removeEventListener('change', handlerRef.current);
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      mediaQueryRef.current = mq;
      handlerRef.current = handler;
    }

    return () => {
      if (mediaQueryRef.current && handlerRef.current) {
        mediaQueryRef.current.removeEventListener('change', handlerRef.current);
      }
    };
  }, [theme]);

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  };

  return (
    <div className="relative group">
      <button
        onClick={cycleTheme}
        className="relative p-2.5 rounded-xl border transition-all duration-300 shadow-sm outline-none cursor-pointer
          bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:gradient-border
          dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white
          night:bg-black night:border-purple-900/40 night:text-purple-400 night:hover:bg-purple-950/20 night:glow-purple"
        aria-label={`Switch theme (currently ${theme})`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {theme === 'light' && (
            <div style={{ animation: 'spinIn 0.5s ease-out' }}>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
          )}
          {theme === 'dark' && (
            <div style={{ animation: 'spinIn 0.5s ease-out' }}>
              <Moon className="w-4 h-4 text-violet-400" />
            </div>
          )}
          {theme === 'night' && (
            <div style={{ animation: 'spinIn 0.5s ease-out' }}>
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
          )}
          {theme === 'system' && (
            <div style={{ animation: 'spinIn 0.5s ease-out' }}>
              <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
          )}
          <span className="hidden sm:inline capitalize">{theme}</span>
        </div>
      </button>

      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 dark:bg-slate-700 night:bg-purple-950 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
        Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-700 night:border-b-purple-950" />
      </div>
    </div>
  );
}
