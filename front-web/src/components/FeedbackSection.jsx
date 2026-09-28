import { useCallback, useEffect, useMemo, useState } from 'react';
import { CornerDownRight, Loader2, MessageSquare, SendHorizonal, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { feedbackApi } from '../api/feedback.js';
import { reactionsApi } from '../api/reactions.js';
import CommentReactions from './CommentReactions.jsx';

const EMPTY = { like: 0, dislike: 0, love: 0, total: 0 };

function toCountMap(summaries) {
  const map = {};
  for (const [id, value] of Object.entries(summaries || {})) {
    map[id] = { ...EMPTY, ...value };
  }
  return map;
}

function Author({ user }) {
  return <span className="font-bold text-slate-700 dark:text-slate-200">{user?.name || 'Guest'}</span>;
}

function Timestamp({ value }) {
  return (
    <span className="text-slate-400">
      {value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
    </span>
  );
}

export default function FeedbackSection({ parentEntity, parentId }) {
  const { user, can } = useAuth();
  const [items, setItems] = useState([]);
  const [replies, setReplies] = useState({});
  const [counts, setCounts] = useState({});
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Per-comment UI state: which reply box is open and its draft text.
  const [openReply, setOpenReply] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [replyBusy, setReplyBusy] = useState('');
  const [replyError, setReplyError] = useState('');

  // Replies are threaded, so the top level only renders root entries.
  const roots = useMemo(() => items.filter((item) => item.type !== 'reply'), [items]);

  const load = useCallback(async () => {
    try {
      const feedbackResult = await feedbackApi.list({ parentEntity, parentId });
      const list = feedbackResult.items || [];
      setItems(list);

      const rootIds = list.filter((item) => item.type !== 'reply').map((item) => item._id);
      if (rootIds.length === 0) {
        setReplies({});
        setCounts({});
        return;
      }

      const [nested, reactions] = await Promise.all([
        feedbackApi.replies(rootIds),
        reactionsApi.counts('feedback', rootIds),
      ]);
      setReplies(nested.replies || {});
      setCounts(toCountMap(reactions.summaries));
    } catch {
      /* ignore */
    }
  }, [parentEntity, parentId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await feedbackApi.create({ parentEntity, parentId, type: 'comment', content });
      setContent('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReply(e, commentId) {
    e.preventDefault();
    if (!replyDraft.trim()) return;
    setReplyBusy(commentId);
    setReplyError('');
    try {
      await feedbackApi.create({ parentEntity: 'feedback', parentId: commentId, type: 'reply', content: replyDraft });
      setReplyDraft('');
      setOpenReply('');
      load();
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Failed to reply. Try again.');
    } finally {
      setReplyBusy('');
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

  function adjustCount(commentId, type, delta) {
    setCounts((current) => {
      const next = { ...current, [commentId]: { ...EMPTY, ...(current[commentId] || {}) } };
      next[commentId][type] = Math.max(0, (next[commentId][type] || 0) + delta);
      next[commentId].total = Math.max(0, (next[commentId].total || 0) + delta);
      return next;
    });
  }

  function toggleReplyBox(commentId) {
    setReplyError('');
    setOpenReply((current) => (current === commentId ? '' : commentId));
  }

  const canDelete = (item) => !!user && (can('projects', 'DELETE') || can('blogs', 'DELETE') || (item.user?._id && item.user._id === user._id));

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Discussion</h3>
      </div>

      {/* Existing comments, each with reactions and replies */}
      <div className="space-y-4">
        {roots.length === 0 && (
          <p className="text-sm text-slate-400">No feedback yet. Be the first to share your thoughts.</p>
        )}
        {roots.map((item) => {
          const nested = replies[item._id] || [];
          const replyOpen = openReply === item._id;
          return (
            <div
              key={item._id}
              className="rounded-2xl bg-white dark:bg-slate-800/40 night:bg-black/40 border border-slate-200/60 dark:border-slate-800 night:border-purple-900/20"
            >
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Author user={item.user} />
                    <Timestamp value={item.createdAt} />
                  </div>
                  {canDelete(item) && (
                    <button
                      onClick={() => remove(item._id)}
                      aria-label="Delete comment"
                      className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.content}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-700/60">
                <CommentReactions commentId={item._id} summary={counts[item._id]} onCountChange={adjustCount} />
                <button
                  type="button"
                  onClick={() => toggleReplyBox(item._id)}
                  aria-expanded={replyOpen}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600 cursor-pointer dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  {replyOpen ? 'Cancel' : 'Reply'}
                  {nested.length > 0 && <span className="text-slate-400">({nested.length})</span>}
                </button>
              </div>

              {nested.length > 0 && (
                <ul className="space-y-2 border-t border-slate-100 px-4 py-3 dark:border-slate-700/60">
                  {nested.map((reply) => (
                    <li key={reply._id} className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Author user={reply.user} />
                          <span className="uppercase px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                            reply
                          </span>
                          <Timestamp value={reply.createdAt} />
                        </div>
                        {canDelete(reply) && (
                          <button
                            onClick={() => remove(reply._id)}
                            aria-label="Delete reply"
                            className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{reply.content}</p>
                    </li>
                  ))}
                </ul>
              )}

              {replyOpen && (
                <form onSubmit={(event) => submitReply(event, item._id)} className="space-y-2 border-t border-slate-100 px-4 py-3 dark:border-slate-700/60">
                  <textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    rows={2}
                    autoFocus
                    placeholder={user ? 'Write a reply…' : 'Write a reply (posted as guest)…'}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 night:bg-black dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  {replyError && <p className="text-sm text-rose-500">{replyError}</p>}
                  <button
                    type="submit"
                    disabled={replyBusy === item._id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {replyBusy === item._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SendHorizonal className="w-3.5 h-3.5" />}
                    Reply
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {/* New comment */}
      <form onSubmit={submit} className="space-y-3">
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
