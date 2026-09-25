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
  { key: 'projects', label: 'Projects', icon: FolderKanban, to: '/admin/projects', tone: 'text-indigo-600 bg-indigo-50' },
  { key: 'blogs', label: 'Blogs', icon: FileText, to: '/admin/blogs', tone: 'text-emerald-600 bg-emerald-50' },
  { key: 'requests', label: 'Requests', icon: Inbox, to: '/admin/requests', tone: 'text-amber-600 bg-amber-50' },
  { key: 'subscribers', label: 'Subscribers', icon: Mail, to: '/admin/subscribers', tone: 'text-sky-600 bg-sky-50' },
  { key: 'users', label: 'Users', icon: Users, to: '/admin/users', tone: 'text-purple-600 bg-purple-50' },
  { key: 'plans', label: 'Plans', icon: CalendarRange, to: '/admin/plans', tone: 'text-rose-600 bg-rose-50' },
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
      results.forEach((r, i) => {
        next[keys[i]] = r.status === 'fulfilled' ? r.value.meta?.total ?? 0 : null;
      });
      setStats(next);
      setLoading(false);
    });
    requestsApi
      .listAll({ limit: 6 })
      .then((r) => {
        if (active) setRecent(r.items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {CARDS.filter((c) => !['users', 'plans', 'subscribers'].includes(c.key) || can(c.key === 'users' ? 'users' : c.key, 'READ')).map((card) => {
          const Icon = card.icon;
          const count = stats[card.key];
          return (
            <Link
              key={card.key}
              to={card.to}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-2 rounded-xl ${card.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
                {count === null ? '—' : count}
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent requests</h2>
          <Link to="/admin/requests" className="text-xs font-semibold text-indigo-600 dark:text-violet-400">
            View all
          </Link>
        </div>
        {!loading && recent.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No requests yet.</p>
        )}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent.map((r) => (
            <div key={r._id} className="px-5 py-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <Badge tone={r.isRead ? 'green' : 'amber'}>{r.isRead ? 'read' : 'new'}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}