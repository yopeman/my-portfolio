import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarRange, FileText, FolderKanban, Inbox, Mail, Plus, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { projectsApi } from '../../api/projects.js';
import { blogsApi } from '../../api/blogs.js';
import { requestsApi } from '../../api/requests.js';
import { subscribersApi } from '../../api/subscribers.js';
import { usersApi } from '../../api/users.js';
import { plansApi } from '../../api/plans.js';
import { AdminHeader, AdminPanel, Badge, EmptyState } from '../../components/admin/form.jsx';

const CARDS = [
  { key: 'projects', label: 'Projects', icon: FolderKanban, to: '/admin/projects', tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300' },
  { key: 'blogs', label: 'Blogs', icon: FileText, to: '/admin/blogs', tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300' },
  { key: 'requests', label: 'Requests', icon: Inbox, to: '/admin/requests', tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300' },
  { key: 'subscribers', label: 'Subscribers', icon: Mail, to: '/admin/subscribers', tone: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-300' },
  { key: 'users', label: 'Users', icon: Users, to: '/admin/users', tone: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300' },
  { key: 'plans', label: 'Plans', icon: CalendarRange, to: '/admin/plans', tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300' },
];

const REQUESTS = [
  { key: 'projects', resource: 'projects', load: () => projectsApi.list({ limit: 1 }) },
  { key: 'blogs', resource: 'blogs', load: () => blogsApi.list({ limit: 1 }) },
  { key: 'requests', resource: 'requests', load: () => requestsApi.listAll({ limit: 1 }) },
  { key: 'subscribers', resource: 'subscribers', load: () => subscribersApi.list({ limit: 1 }) },
  { key: 'users', resource: 'users', load: () => usersApi.list({ limit: 1 }) },
  { key: 'plans', resource: 'plans', load: () => plansApi.list({ limit: 1 }) },
];

function firstName(name = '') {
  return name.split(' ')[0] || 'there';
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { can, user } = useAuth();
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(() => can('requests', 'READ'));

  useEffect(() => {
    let active = true;
    const allowed = REQUESTS.filter(({ resource }) => can(resource, 'READ'));
    Promise.allSettled(allowed.map(({ load }) => load())).then((results) => {
      if (!active) return;
      const next = {};
      results.forEach((result, index) => {
        next[allowed[index].key] = result.status === 'fulfilled' ? result.value.meta?.total ?? result.value.items?.length ?? 0 : null;
      });
      setStats(next);
      setLoading(false);
    });

    if (can('requests', 'READ')) {
      requestsApi.listAll({ limit: 6 }).then((result) => {
        if (active) setRecent(result.items || []);
      }).catch(() => {}).finally(() => {
        if (active) setRecentLoading(false);
      });
    }

    return () => { active = false; };
  }, [can]);

  const visibleCards = CARDS.filter((card) => can(card.key, 'READ'));

  return (
    <div className="space-y-7">
      <AdminHeader
        eyebrow="Overview"
        title={`${greeting()}, ${firstName(user?.name)}.`}
        description="A clear view of your content, audience, and the next action worth taking."
        actions={<Link to="/admin/projects" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-indigo-700 dark:bg-white dark:text-slate-900 dark:hover:bg-indigo-100"><Plus className="h-4 w-4" /> New project</Link>}
      />

      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-7 text-white shadow-2xl shadow-indigo-500/20 sm:px-8 sm:py-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[28px] border-white/10" />
        <div className="absolute -bottom-28 right-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> Workspace pulse</div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your portfolio is looking good.</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-indigo-100/80">Keep the momentum going with a quick update to your projects, posts, or latest requests.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can('requests', 'READ') && <Link to="/admin/requests" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25">Open inbox <ArrowUpRight className="h-4 w-4" /></Link>}
            <Link to="/admin/about" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10">Edit profile <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6" aria-busy={loading}>
        {visibleCards.map((card) => {
          const Icon = card.icon;
          const count = stats[card.key];
          return (
            <Link key={card.key} to={card.to} className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800/70 dark:bg-slate-900/70 dark:hover:border-violet-700/60">
              <div className={`inline-flex rounded-xl p-2 transition-transform duration-200 group-hover:scale-110 ${card.tone}`}><Icon className="h-5 w-5" /></div>
              <div className="mt-3 text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">{count === undefined ? <span className="inline-block h-7 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" /> : count === null ? '—' : count}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{card.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <AdminPanel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
            <div><h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent requests</h2><p className="mt-1 text-xs text-slate-400">The latest messages from your contact form.</p></div>
            {can('requests', 'READ') && <Link to="/admin/requests" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 transition hover:text-indigo-500 dark:text-violet-400">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>}
          </div>
          {recentLoading ? (
            <div className="space-y-3 p-5"><div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /></div>
          ) : recent.length === 0 ? (
            <EmptyState icon={Inbox} title="Your inbox is clear" description="New contact requests will appear here as they arrive." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((request) => (
                <Link key={request._id} to="/admin/requests" className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{request.message}</p><p className="mt-0.5 text-xs text-slate-400">{new Date(request.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
                  <Badge tone={request.isRead ? 'green' : 'amber'} dot>{request.isRead ? 'read' : 'new'}</Badge>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel className="p-5">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-600 dark:text-violet-400">Shortcuts</p><h2 className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">Quick actions</h2></div><span className="text-xl">✦</span></div>
          <div className="mt-5 space-y-2">
            {can('projects', 'READ') && <Link to="/admin/projects" className="group flex items-center gap-3 rounded-xl border border-slate-200/70 p-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-800/70 dark:hover:border-violet-700/60 dark:hover:bg-violet-950/20"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><FolderKanban className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-700 dark:text-slate-200">Manage projects</span><span className="block text-[11px] text-slate-400">Keep your case studies fresh</span></span><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500" /></Link>}
            {can('blogs', 'READ') && <Link to="/admin/blogs" className="group flex items-center gap-3 rounded-xl border border-slate-200/70 p-3 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-slate-800/70 dark:hover:border-emerald-700/60 dark:hover:bg-emerald-950/20"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"><FileText className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-700 dark:text-slate-200">Write something</span><span className="block text-[11px] text-slate-400">Share a new idea</span></span><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500" /></Link>}
            {can('about', 'READ') && <Link to="/admin/about" className="group flex items-center gap-3 rounded-xl border border-slate-200/70 p-3 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/60 dark:border-slate-800/70 dark:hover:border-violet-700/60 dark:hover:bg-violet-950/20"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300"><Sparkles className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-700 dark:text-slate-200">Update profile</span><span className="block text-[11px] text-slate-400">Tell visitors what is new</span></span><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-500" /></Link>}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
