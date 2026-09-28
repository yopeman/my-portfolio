import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { reactionsApi } from '../api/reactions.js';

const TYPES = [
  { key: 'like', icon: ThumbsUp, active: 'bg-indigo-600 border-indigo-600 text-white', idle: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400' },
  { key: 'love', icon: Heart, active: 'bg-rose-600 border-rose-600 text-white', idle: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-400' },
  { key: 'dislike', icon: ThumbsDown, active: 'bg-slate-600 border-slate-600 text-white', idle: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400' },
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
      {TYPES.map(({ key, icon: Icon, active, idle }) => {
        const isActive = mine === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            disabled={busy}
            aria-label={`${key} this comment`}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
              compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
            } ${isActive ? active : idle}`}
          >
            <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
            <span>{counts[key] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
