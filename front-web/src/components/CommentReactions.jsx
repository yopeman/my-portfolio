import { useState } from 'react';
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

/**
 * Reaction toggles for a single comment. Reactions are stored against
 * parentEntity "feedback" with parentId set to the comment _id.
 */
export default function CommentReactions({ commentId, summary, onCountChange, size = 'sm' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mine, setMine] = useState(null);
  const [busy, setBusy] = useState(false);

  const counts = { ...EMPTY, ...(summary || {}) };
  const compact = size === 'sm';

  async function toggle(type) {
    if (busy) return;
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setBusy(true);
    // Optimistic count so the button responds immediately.
    const wasActive = mine === type;
    setMine(wasActive ? null : type);
    const delta = wasActive ? -1 : 1;
    onCountChange?.(commentId, type, delta);
    try {
      await reactionsApi.toggle({ parentEntity: 'feedback', parentId: commentId, type });
    } catch {
      setMine(wasActive ? type : null);
      onCountChange?.(commentId, type, -delta);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
      {TYPES.map(({ key, icon: Icon, label }) => {
        const isActive = mine === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            disabled={busy}
            aria-label={`${label} this comment`}
            aria-pressed={isActive}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all duration-200 disabled:opacity-50 ${
              compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
            } ${
              isActive
                ? key === 'love'
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : key === 'dislike'
                    ? 'border-slate-500 bg-slate-500 text-white'
                    : 'border-indigo-500 bg-indigo-500 text-white dark:border-violet-500 dark:bg-violet-500'
                : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300'
            }`}
          >
            <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />
            <span className="counter-value">{counts[key] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
