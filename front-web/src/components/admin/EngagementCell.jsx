import { Heart, MessageSquare, Reply, ThumbsUp } from 'lucide-react';

/**
 * Compact engagement summary for an admin table row: comment, reply, and
 * reaction totals in one glance. Renders as empty state until data arrives.
 */
export default function EngagementCell({ stats, onClick, loading = false, className = '' }) {
  const comments = stats?.comments ?? 0;
  const replies = stats?.replies ?? 0;
  const likes = (stats?.like ?? 0) + (stats?.love ?? 0);
  const quiet = comments === 0 && replies === 0 && likes === 0;

  const pill = (Icon, value, label, tone) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
        value > 0 ? tone : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
      }`}
    >
      <Icon className="h-3 w-3" />
      {value}
      <span className="sr-only">{label}</span>
    </span>
  );

  if (loading) {
    return <div className={`h-5 w-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 ${className}`} />;
  }

  if (quiet) {
    return <span className={`text-xs text-slate-300 dark:text-slate-600 ${className}`}>No engagement</span>;
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        title="Open feedback and reactions"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-1 py-0.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {pill(MessageSquare, comments, 'comments', 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300')}
        {pill(Reply, replies, 'replies', 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300')}
        {pill(ThumbsUp, stats?.like ?? 0, 'likes', 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300')}
        {pill(Heart, stats?.love ?? 0, 'loves', 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300')}
      </button>
    </div>
  );
}
