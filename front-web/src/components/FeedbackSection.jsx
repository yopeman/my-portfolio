import { useCallback, useEffect, useMemo, useState } from 'react';
import { CornerDownRight, Loader2, MessageSquare, SendHorizonal, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { feedbackApi } from '../api/feedback.js';
import { reactionsApi } from '../api/reactions.js';
import CommentReactions from './CommentReactions.jsx';
import { Notice, TextArea } from './ui.jsx';

const EMPTY = { like: 0, dislike: 0, love: 0, total: 0 };

// Mirrors RESOURCE_MAP on the server: which permission resource moderates a thread.
const MODERATION_RESOURCES = {
  about: 'about',
  project: 'projects',
  blog: 'blogs',
  plan: 'plans',
  system: 'users',
};

function toCountMap(summaries) {
  const map = {};
  for (const [id, value] of Object.entries(summaries || {})) {
    map[id] = { ...EMPTY, ...value };
  }
  return map;
}

function Author({ user }) {
  return (
    <span className="font-extrabold text-slate-800 dark:text-slate-100">
      {user?.name || 'Guest'}
    </span>
  );
}

function Timestamp({ value }) {
  if (!value) return null;
  return (
    <time dateTime={new Date(value).toISOString()} className="text-slate-400">
      {new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
    </time>
  );
}

function ReplyList({ replies, counts, canDelete, onDelete, adjustCount, busyId }) {
  return (
    <ul className="space-y-2.5 border-t border-slate-200/60 p-4 dark:border-slate-800/60">
      {replies.map((reply) => (
        <li key={reply._id} className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-900/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Author user={reply.user} />
              <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-700/70 dark:text-slate-300">
                Reply
              </span>
              <Timestamp value={reply.createdAt} />
            </div>
            {canDelete(reply) && (
              <button
                type="button"
                onClick={() => onDelete(reply._id)}
                aria-label={`Delete reply from ${reply.user?.name || 'guest'}`}
                className="focus-ring shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{reply.content}</p>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <CommentReactions commentId={reply._id} summary={counts[reply._id]} onCountChange={adjustCount} />
            <time dateTime={new Date(reply.createdAt).toISOString()} className="text-[10px] text-slate-400">
              {new Date(reply.createdAt).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
      {busyId && <li className="sr-only" role="status">Posting reply…</li>}
    </ul>
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
      const replyMap = nested.replies || {};
      setReplies(replyMap);
      setCounts(toCountMap(reactions.summaries));

      // Replies carry their own reactions, so they need a second batched lookup.
      const replyIds = Object.values(replyMap).flat().map((reply) => reply._id);
      if (replyIds.length === 0) return;
      const replyReactions = await reactionsApi.counts('feedback', replyIds);
      setCounts((current) => ({ ...current, ...toCountMap(replyReactions.summaries) }));
    } catch {
      /* the thread stays empty rather than showing an error wall */
    }
  }, [parentEntity, parentId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function submit(event) {
    event.preventDefault();
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

  async function submitReply(event, commentId) {
    event.preventDefault();
    if (!replyDraft.trim()) return;
    setReplyBusy(commentId);
    setReplyError('');
    try {
      await feedbackApi.create({
        parentEntity: 'feedback',
        parentId: commentId,
        type: 'reply',
        content: replyDraft,
      });
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

  // Own comments are always deletable. Otherwise the thread is moderated by
  // whoever holds DELETE on the resource that owns it.
  const canDelete = (item) => {
    if (!user) return false;
    if (item.user?._id && item.user._id === user._id) return true;
    return can(MODERATION_RESOURCES[parentEntity] || 'projects', 'DELETE');
  };

  return (
    <section className="mt-10">
      <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
        <MessageSquare className="h-5 w-5 text-indigo-500" aria-hidden="true" />
        Discussion
        {roots.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {roots.length}
          </span>
        )}
      </h3>

      <div className="mt-5 space-y-4">
        {roots.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300/80 px-5 py-8 text-center text-sm text-slate-400 dark:border-slate-700/80">
            No feedback yet. Be the first to share your thoughts.
          </p>
        ) : (
          roots.map((item) => {
            const nested = replies[item._id] || [];
            const replyOpen = openReply === item._id;
            return (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/40 night:border-purple-900/15"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Author user={item.user} />
                      <Timestamp value={item.createdAt} />
                    </div>
                    {canDelete(item) && (
                      <button
                        type="button"
                        onClick={() => remove(item._id)}
                        aria-label="Delete comment"
                        className="focus-ring shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.content}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/60 px-4 py-3 dark:border-slate-800/60">
                  <CommentReactions commentId={item._id} summary={counts[item._id]} onCountChange={adjustCount} />
                  <button
                    type="button"
                    onClick={() => toggleReplyBox(item._id)}
                    aria-expanded={replyOpen}
                    className="focus-ring inline-flex items-center gap-1.5 rounded text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300"
                  >
                    <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                    {replyOpen ? 'Cancel' : 'Reply'}
                    {nested.length > 0 && <span className="text-slate-400">({nested.length})</span>}
                  </button>
                </div>

                {nested.length > 0 && (
                  <ReplyList
                    replies={nested}
                    counts={counts}
                    canDelete={canDelete}
                    onDelete={remove}
                    adjustCount={adjustCount}
                    busyId={replyBusy}
                  />
                )}

                {replyOpen && (
                  <form
                    onSubmit={(event) => submitReply(event, item._id)}
                    className="space-y-3 border-t border-slate-200/60 p-4 dark:border-slate-800/60"
                  >
                    <label htmlFor={`reply-${item._id}`} className="sr-only">
                      Write a reply
                    </label>
                    <TextArea
                      id={`reply-${item._id}`}
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      rows={2}
                      autoFocus
                      placeholder={user ? 'Write a reply…' : 'Write a reply (posted as guest)…'}
                      required
                      className="resize-none"
                    />
                    {replyError && <Notice tone="error">{replyError}</Notice>}
                    <button
                      type="submit"
                      disabled={replyBusy === item._id}
                      className="btn-primary btn-icon text-xs"
                    >
                      {replyBusy === item._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <SendHorizonal className="h-3.5 w-3.5" aria-hidden="true" />}
                      Reply
                    </button>
                  </form>
                )}
              </article>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <label htmlFor={`new-comment-${parentId}`} className="block text-sm font-bold text-slate-700 dark:text-slate-200">
          Leave a comment
        </label>
        <TextArea
          id={`new-comment-${parentId}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder={user ? 'Share your thoughts…' : 'Share your thoughts (posted as guest)…'}
          required
          className="resize-none"
        />
        {error && <Notice tone="error">{error}</Notice>}
        <button type="submit" disabled={submitting} className="btn-primary btn-icon text-sm">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <SendHorizonal className="h-4 w-4" aria-hidden="true" />}
          Post comment
        </button>
      </form>
    </section>
  );
}
