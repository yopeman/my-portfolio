import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FileText, Inbox, Users, Mail, UserRound, CalendarRange, ImageIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban, resource: 'projects' },
  { to: '/admin/blogs', label: 'Blogs', icon: FileText, resource: 'blogs' },
  { to: '/admin/requests', label: 'Requests', icon: Inbox, resource: 'requests' },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Mail, resource: 'subscribers' },
  { to: '/admin/users', label: 'Users', icon: Users, resource: 'users' },
  { to: '/admin/about', label: 'About', icon: UserRound, resource: 'about' },
  { to: '/admin/plans', label: 'Plans', icon: CalendarRange, resource: 'plans' },
  { to: '/admin/files', label: 'Files', icon: ImageIcon },
];

export default function AdminLayout() {
  const { user, logout, can } = useAuth();
  const location = useLocation();
  const visibleNav = NAV.filter((item) => !item.resource || can(item.resource, 'READ'));

  const navLink = (item) => {
    const Icon = item.icon;
    const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to);
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/admin'}
        className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${active ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-600 hover:translate-x-0.5 hover:bg-white/80 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-violet-300'}`}
      >
        <Icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : ''}`} />
        {item.label}
      </NavLink>
    );
  };

  return (
    <div className="ticks-bg relative flex min-h-screen flex-col overflow-x-hidden bg-slate-100/80 dark:bg-slate-950 night:bg-black">
      <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-morph" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl animate-float-slow" />

      <header className="glass sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-800/70 night:border-purple-900/20">
        <div className="relative flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-violet-400"><ArrowLeft className="h-4 w-4" /> Site</Link>
            <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-sm font-extrabold tracking-tight text-indigo-600 dark:text-violet-400">Admin</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">{user?.name} <span className="text-xs opacity-70">({user?.role})</span></span>
            <button type="button" onClick={logout} className="cursor-pointer rounded-xl bg-slate-200/80 px-3 py-1.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">Logout</button>
          </div>
        </div>
      </header>

      <nav className="glass-strong sticky top-16 z-20 flex gap-1 overflow-x-auto border-b border-slate-200/60 px-3 py-2 md:hidden dark:border-slate-800/70" aria-label="Admin navigation">
        {visibleNav.map(navLink)}
      </nav>

      <div className="relative flex flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200/60 bg-white/65 p-4 backdrop-blur-xl md:block dark:border-slate-800/70 dark:bg-slate-900/65 night:bg-black/75">
          <nav className="space-y-1.5">{visibleNav.map(navLink)}</nav>
          <div className="absolute inset-x-4 bottom-5 rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 p-4 dark:border-violet-900/30 dark:from-indigo-950/40 dark:to-violet-950/30">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400">Workspace</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Keep the portfolio fresh and ready for the next visitor.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl page-enter"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
