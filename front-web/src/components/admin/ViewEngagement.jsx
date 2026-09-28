import { useCallback, useEffect, useState } from 'react';
import { Heart, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { feedbackApi } from '../../api/feedback.js';
import { reactionsApi } from '../../api/reactions.js';
import { Badge, ViewSection } from './form.jsx';
import { refLabel } from './view-utils.js';

const FEEDBACK_TYPES = ['feedback', 'comment', 'reply'];
const REACTION_TYPES = [
  { key: 'like', icon: ThumbsUp, tone: 'indigo' },
  { key: 'love', icon: Heart, tone: 'rose' },
  { key: 'dislike', icon: ThumbsDown, tone: 'slate' },
];

const EMPTY_SUMMARY = { like: 0, dislike: 0, love: 0, total: 0 };

function ReactionCounts({ summary, compact = false }) {
  const value = { ...EMPTY_SUMMARY, ...(summary || {}) };
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {REACTION_TYPES.map(({ key, icon: Icon, tone }) => (
          <Badge key={key} tone={tone}>
            <Icon className="h-3 w-3" /> {value[key] ?? 0}
          </Badge>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTION_TYPES.map(({ key, icon: Icon }) => (
        <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon className="h-3.5 w-3.5" />
          {key}
          <span className="text-slate-400">{value[key] ?? 0}</span>
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        total
        <span className="text-slate-400">{value.total ?? 0}</span>
      </span>
    </div>
  );
}

export default function ViewEngagement({ parentEntity, parentId, className = '' }) {
  const [items, setItems] = useState([]);
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
    setItems(feedbackItems);
    if (feedbackResult.status === 'rejected') setError('Feedback could not be loaded.');
    else if (reactionResult.status === 'rejected') setError('Reactions could not be loaded.');
    else setError('');

    if (reactionResult.status === 'fulfilled') {
      setSummary({ ...EMPTY_SUMMARY, ...(reactionResult.value.summary || {}) });
    } else {
      setSummary(EMPTY_SUMMARY);
    }

    // Feedback entries carry their own reactions, fetched as a single batched request.
    if (feedbackItems.length > 0) {
      try {
        const batch = await reactionsApi.counts('feedback', feedbackItems.map((item) => item._id));
        setCounts(batch.summaries || {});
      } catch {
        setCounts({});
      }
    } else {
      setCounts({});
    }

    setLoading(false);
  }, [parentEntity, parentId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className={className}>
      <ViewSection
        title="Reactions"
        description={`Aggregated ${parentEntity} reactions recorded by visitors.`}
        count={summary.total ?? 0}
      >
        {loading ? (
          <div className="h-6 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        ) : (
          <ReactionCounts summary={summary} />
        )}
      </ViewSection>

      <ViewSection
        title="Feedback"
        description="Comments, replies, and feedback left against this record."
        count={items.length}
        className="mt-4"
      >
        {error && <p role="alert" className="mb-3 text-xs font-medium text-rose-500">{error}</p>}
        {loading ? (
          <div className="space-y-2">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : items.length === 0 ? (
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <MessageSquare className="h-3.5 w-3.5" /> No feedback recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item._id} className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 dark:border-slate-800/70 dark:bg-slate-900/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{refLabel(item.user) || 'Guest'}</span>
                  {FEEDBACK_TYPES.includes(item.type) && <Badge tone="indigo">{item.type}</Badge>}
                  <span className="text-[10px] text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'No date'}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.content}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ReactionCounts summary={counts[item._id]} compact />
                  <span className="text-[10px] text-slate-400">Feedback ID {item._id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ViewSection>
    </div>
  );
}
