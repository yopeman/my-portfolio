import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { reactionsApi } from '../api/reactions.js';

const TYPES = [
  { key: 'like', icon: ThumbsUp, label: 'Like' },
  { key: 'love', icon: Heart, label: 'Love' },
  { key: 'dislike', icon: ThumbsDown, label: 'Dislike' },
];

const EMPTY = { like: 0, dislike: 0, love: 0 };

export default function ReactionBar({ parentEntity, parentId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(EMPTY);
  const [mine, setMine] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    reactionsApi
      .summary({ parentEntity, parentId })
      .then((r) => {
        if (!active) return;
        setSummary({ ...EMPTY, ...(r.summary || {}) });
        setMine(r.mine || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [parentEntity, parentId]);

  async function toggle(type) {
    if (busy) return;
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setBusy(true);
    try {
      await reactionsApi.toggle({ parentEntity, parentId, type });
      // Re-read after the write so the server stays the source of truth.
      const r = await reactionsApi.summary({ parentEntity, parentId });
      setSummary({ ...EMPTY, ...(r.summary || {}) });
      setMine(r.mine || null);
    } catch {
      /* keep the last known counts rather than flickering back */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {TYPES.map(({ key, icon: Icon, label }) => {
        const isActive = mine === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            disabled={busy}
            aria-label={label}
            aria-pressed={isActive}
            className={`focus-ring inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-200 disabled:opacity-60 ${
              isActive
                ? key === 'love'
                  ? 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                  : key === 'dislike'
                    ? 'border-slate-500 bg-slate-500 text-white'
                    : 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 dark:border-violet-500 dark:bg-violet-500'
                : 'border-slate-200 bg-white/80 text-slate-600 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
            <span className="counter-value text-xs opacity-80">{summary[key] ?? 0}</span>
          </button>
        );
      })}

      {!user && (
        <button
          type="button"
          onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
          className="focus-ring rounded text-xs font-semibold text-slate-400 underline-offset-4 transition-colors hover:text-indigo-600 hover:underline dark:hover:text-violet-300"
        >
          Sign in to react
        </button>
      )}
    </div>
  );
}
