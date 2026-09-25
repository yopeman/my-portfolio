import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, FileText, Inbox, Mail, Users, CalendarRange } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { projectsApi } from '../../api/projects.js';
import { blogsApi } from '../../api/blogs.js';
import { requestsApi } from '../../api/requests.js';
import { subscribersApi } from '../../api/subscribers.js';
import { usersApi } from '../../api/users.js';
import { plansApi } from '../../api/plans.js';
import { Badge } from '../../components/admin/form.jsx';

const CARDS = [
  { key: 'projects', label: 'Projects', icon: FolderKanban, to: '/admin/projects', tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300' },
  { key: 'blogs', label: 'Blogs', icon: FileText, to: '/admin/blogs', tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300' },
  { key: 'requests', label: 'Requests', icon: Inbox, to: '/admin/requests', tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300' },
  { key: 'subscribers', label: 'Subscribers', icon: Mail, to: '/admin/subscribers', tone: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-300' },
  { key: 'users', label: 'Users', icon: Users, to: '/admin/users', tone: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300' },
  { key: 'plans', label: 'Plans', icon: CalendarRange, to: '/admin/plans', tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300' },
];

export default function Dashboard() {
  const { can } = useAuth();
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      projectsApi.list({ limit: 1 }),
      blogsApi.list({ limit: 1 }),
      requestsApi.listAll({ limit: 1 }),
      subscribersApi.list({ limit: 1 }),
      usersApi.list({ limit: 1 }),
      plansApi.list({ limit: 1 }),
    ]).then((results) => {
      if (!active) return;
      const keys = ['projects', 'blogs', 'requests', 'subscribers', 'users', 'plans'];
      const next = {};
      results.forEach((result, index) => { next[keys[index]] = result.status === 'fulfilled' ? result.value.meta?.total ?? 0 : null; });
      setStats(next);
      setLoading(false);
    });
    requestsApi.listAll({ limit: 6 }).then((result) => { if (active) setRecent(result.items); }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-violet-400">Overview</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Good to see you.</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">A quick pulse on everything happening in your portfolio.</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">All systems operational</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6" aria-busy={loading}>
        {CARDS.filter((card) => !['users', 'plans', 'subscribers'].includes(card.key) || can(card.key, 'READ')).map((card) => {
          const Icon = card.icon;
          const count = stats[card.key];
          return (
            <Link key={card.key} to={card.to} className="admin-surface group rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className={`inline-flex rounded-xl p-2 transition-transform duration-300 group-hover:scale-110 ${card.tone}`}><Icon className="h-5 w-5" /></div>
              <div className="mt-3 text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">{count === null ? '—' : count}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="admin-surface overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4 dark:border-slate-800/70">
          <div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent requests</h2><p className="mt-1 text-xs text-slate-400">The latest messages from the contact form.</p></div>
          <Link to="/admin/requests" className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-violet-400">View all</Link>
        </div>
        {!loading && recent.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">No requests yet.</p>}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent.map((request) => (
            <div key={request._id} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{request.message}</p><p className="mt-0.5 text-xs text-slate-400">{new Date(request.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
              <Badge tone={request.isRead ? 'green' : 'amber'}>{request.isRead ? 'read' : 'new'}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
