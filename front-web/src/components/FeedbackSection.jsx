import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, SendHorizonal, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { feedbackApi } from '../api/feedback.js';

const TYPES = ['feedback', 'comment', 'reply'];

export default function FeedbackSection({ parentEntity, parentId }) {
  const { user, can } = useAuth();
  const [items, setItems] = useState([]);
  const [type, setType] = useState('feedback');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    feedbackApi
      .list({ parentEntity, parentId })
      .then((r) => setItems(r.items))
      .catch(() => {});
  }, [parentEntity, parentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await feedbackApi.create({ parentEntity, parentId, type, content });
      setContent('');
      setType('feedback');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    try {
      await feedbackApi.remove(id);
      load();
    } catch {
      /* ignore */
    }
  }

  const canDelete = (item) => user && (can('projects', 'DELETE') || can('blogs', 'DELETE') || (item.user?._id && item.user._id === user._id));

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Discussion</h3>
      </div>

      {/* Existing feedback */}
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-slate-400">No feedback yet. Be the first to share your thoughts.</p>
        )}
        {items.map((item) => (
          <div
            key={item._id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 night:bg-black/40 border border-slate-200/60 dark:border-slate-800 night:border-purple-900/20"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {item.user?.name || 'Guest'}
                </span>
                {item.type && (
                  <span className="uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-violet-400 text-[10px] font-bold">
                    {item.type}
                  </span>
                )}
                <span className="text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
              {canDelete(item) && (
                <button
                  onClick={() => remove(item._id)}
                  aria-label="Delete feedback"
                  className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.content}</p>
          </div>
        ))}
      </div>

      {/* New feedback */}
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors cursor-pointer ${
                type === t
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder={user ? 'Share your thoughts…' : 'Share your thoughts (posted as guest)…'}
          required
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 night:bg-black dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
          Post
        </button>
      </form>
    </div>
  );
}