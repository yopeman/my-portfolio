import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { reactionsApi } from '../api/reactions.js';

const TYPES = [
  { key: 'like', icon: ThumbsUp, label: 'Like' },
  { key: 'love', icon: Heart, label: 'Love' },
  { key: 'dislike', icon: ThumbsDown, label: 'Dislike' },
];

export default function ReactionBar({ parentEntity, parentId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ like: 0, dislike: 0, love: 0 });
  const [mine, setMine] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    reactionsApi
      .summary({ parentEntity, parentId })
      .then((r) => {
        if (active) {
          setSummary(r.summary || { like: 0, dislike: 0, love: 0 });
          setMine(r.mine || null);
        }
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
      const r = await reactionsApi.summary({ parentEntity, parentId });
      setSummary(r.summary || { like: 0, dislike: 0, love: 0 });
      setMine(r.mine || null);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {TYPES.map(({ key, icon: Icon, label }) => {
          const active = mine === key;
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              disabled={busy}
              aria-label={label}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
                active
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{summary[key] ?? 0}</span>
            </button>
          );
        })}
      </div>
      {!user && <p className="text-xs text-slate-400">Sign in to react to this post.</p>}
    </div>
  );
}