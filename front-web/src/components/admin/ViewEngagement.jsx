import { useCallback, useEffect, useState } from 'react';
import { Heart, MessageSquare, Reply, ThumbsDown, ThumbsUp } from 'lucide-react';
import { feedbackApi } from '../../api/feedback.js';
import { reactionsApi } from '../../api/reactions.js';
import { Badge, ViewSection } from './form.jsx';
import { refLabel } from './view-utils.js';

const REACTION_TYPES = [
  { key: 'like', icon: ThumbsUp, tone: 'indigo' },
  { key: 'love', icon: Heart, tone: 'rose' },
  { key: 'dislike', icon: ThumbsDown, tone: 'slate' },
];

const EMPTY_SUMMARY = { like: 0, dislike: 0, love: 0, total: 0 };

const TONE_CLASSES = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};
const TONE_TEXT = {
  indigo: 'text-indigo-600 dark:text-indigo-300',
  rose: 'text-rose-600 dark:text-rose-300',
  slate: 'text-slate-500 dark:text-slate-400',
};
const TONE_BORDER = {
  indigo: 'border-indigo-100 dark:border-indigo-900/40',
  rose: 'border-rose-100 dark:border-rose-900/40',
  slate: 'border-slate-200/70 dark:border-slate-800/70',
};
const TONE_BAR = {
  indigo: 'bg-indigo-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-400',
};

const STAT_TONES = {
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300',
};

function StatTile({ label, value, icon: Icon, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2.5 dark:border-slate-800/70 dark:bg-slate-900/40">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${STAT_TONES[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function ReactionCounts({ summary, compact = false }) {
  const value = { ...EMPTY_SUMMARY, ...(summary || {}) };
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {REACTION_TYPES.map(({ key, icon: Icon, tone }) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${TONE_CLASSES[tone]}`}
          >
            <Icon className="h-2.5 w-2.5" />
            {value[key] ?? 0}
          </span>
        ))}
      </div>
    );
  }
  const max = Math.max(1, value.like, value.love, value.dislike);
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {REACTION_TYPES.map(({ key, icon: Icon, tone }) => {
        const count = value[key] ?? 0;
        return (
          <div key={key} className={`rounded-xl border px-3 py-2.5 ${TONE_BORDER[tone]}`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${TONE_TEXT[tone]}`}>
                <Icon className="h-3 w-3" />
                {key}
              </span>
              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{count}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-full rounded-full ${TONE_BAR[tone]}`} style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ThreadedComment({ item, replies, counts }) {
  const nested = replies[item._id] || [];
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800/70 dark:bg-slate-900/50">
      <div className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
            {(refLabel(item.user) || 'G').slice(0, 1).toUpperCase()}
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{refLabel(item.user) || 'Guest'}</span>
          <span className="text-[10px] text-slate-400">
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'No date'}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.content}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <ReactionCounts summary={counts[item._id]} compact />
          <span className="text-[10px] text-slate-400">ID {item._id}</span>
        </div>
      </div>
      {nested.length > 0 && (
        <ul className="space-y-1.5 border-t border-slate-200/60 bg-white/40 p-2.5 dark:border-slate-800/60 dark:bg-slate-950/30">
          {nested.map((reply) => (
            <li key={reply._id} className="rounded-lg border border-slate-200/60 bg-white/80 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300">{refLabel(reply.user) || 'Guest'}</span>
                <Badge tone="slate">reply</Badge>
                <span className="text-[10px] text-slate-400">
                  {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : 'No date'}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">{reply.content}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <ReactionCounts summary={counts[reply._id]} compact />
                <span className="text-[10px] text-slate-400">ID {reply._id}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ViewEngagement({ parentEntity, parentId, className = '' }) {
  const [items, setItems] = useState([]);
  const [replies, setReplies] = useState({});
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!parentId) return;
    setLoading(true);
    const [feedbackResult, reactionResult] = await Promise.allSettled([
      feedbackApi.list({ parentEntity, parentId }),
      reactionsApi.summary({ parentEntity, parentId }),
    ]);

    const feedbackItems = feedbackResult.status === 'fulfilled' ? feedbackResult.value.items || [] : [];
    const roots = feedbackItems.filter((item) => item.type !== 'reply');
    setItems(roots);
    if (feedbackResult.status === 'rejected') setError('Feedback could not be loaded.');
    else if (reactionResult.status === 'rejected') setError('Reactions could not be loaded.');
    else setError('');

    if (reactionResult.status === 'fulfilled') {
      setSummary({ ...EMPTY_SUMMARY, ...(reactionResult.value.summary || {}) });
    } else {
      setSummary(EMPTY_SUMMARY);
    }

    // Comments and replies both carry reactions, fetched as a single batched request.
    // The list call only returns root comments, so the reply ids have to come from
    // the threaded lookup and be merged into the same request.
    if (feedbackItems.length > 0) {
      let replyMap = {};
      try {
        const all = await feedbackApi.replies(roots.map((item) => item._id));
        replyMap = all.replies || {};
        setReplies(replyMap);
      } catch {
        setReplies({});
      }
      const replyIds = Object.values(replyMap).flat().map((reply) => reply._id);
      try {
        const batch = await reactionsApi.counts('feedback', [...roots.map((item) => item._id), ...replyIds]);
        setCounts(batch.summaries || {});
      } catch {
        setCounts({});
      }
    } else {
      setReplies({});
      setCounts({});
    }

    setLoading(false);
  }, [parentEntity, parentId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totalComments = items.length;
  const totalReplies = Object.values(replies).reduce((sum, list) => sum + (list?.length || 0), 0);
  // Reactions recorded against comments and replies, broken out from the
  // per-thread counts so the totals can be reported separately.
  const sumCounts = (source) => Object.values(source || {}).reduce(
    (totals, entry) => ({
      like: totals.like + (entry.like || 0),
      love: totals.love + (entry.love || 0),
      dislike: totals.dislike + (entry.dislike || 0),
    }),
    { like: 0, love: 0, dislike: 0 }
  );
  const replyIds = new Set(Object.values(replies).flat().map((reply) => String(reply._id)));
  const commentCounts = sumCounts(Object.fromEntries(Object.entries(counts).filter(([id]) => !replyIds.has(String(id)))));
  const replyCounts = sumCounts(counts);
  const threadTotal = (replyCounts.like + replyCounts.love + replyCounts.dislike);
  const commentTotal = (commentCounts.like + commentCounts.love + commentCounts.dislike);

  return (
    <div className={className}>
      <ViewSection
        title="Reactions"
        description={`Aggregated ${parentEntity} reactions recorded by visitors, plus reactions left on the comments and replies below.`}
        count={(summary.total ?? 0) + commentTotal + threadTotal}
      >
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
          </div>
        ) : (
          <ReactionCounts summary={summary} />
        )}
        {!loading && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatTile label="On comments" value={commentTotal} tone="sky" icon={MessageSquare} />
            <StatTile label="On replies" value={threadTotal} tone="violet" icon={Reply} />
          </div>
        )}
      </ViewSection>

      <ViewSection
        title="Feedback"
        description="Comments and replies left against this record."
        count={totalComments}
        className="mt-4"
      >
        {!loading && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <StatTile label="Comments" value={totalComments} tone="sky" icon={MessageSquare} />
            <StatTile label="Replies" value={totalReplies} tone="violet" icon={Reply} />
          </div>
        )}
        {error && <p role="alert" className="mb-3 text-xs font-medium text-rose-500">{error}</p>}
        {loading ? (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : items.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-400 dark:border-slate-800">
            <MessageSquare className="h-3.5 w-3.5" /> No feedback recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => <ThreadedComment key={item._id} item={item} replies={replies} counts={counts} />)}
          </div>
        )}
      </ViewSection>
    </div>
  );
}
