import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, CalendarRange, FileText, FolderKanban, ImageIcon, Inbox, LayoutDashboard, LogOut, Mail, Menu, UserRound, Users, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/projects', label: 'Projects', icon: FolderKanban, resource: 'projects' },
      { to: '/admin/blogs', label: 'Blogs', icon: FileText, resource: 'blogs' },
      { to: '/admin/files', label: 'Files', icon: ImageIcon },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/admin/requests', label: 'Requests', icon: Inbox, resource: 'requests' },
      { to: '/admin/subscribers', label: 'Subscribers', icon: Mail, resource: 'subscribers' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users, resource: 'users' },
      { to: '/admin/about', label: 'About', icon: UserRound, resource: 'about' },
      { to: '/admin/plans', label: 'Plans', icon: CalendarRange, resource: 'plans' },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap((group) => group.items);

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A';
}

export default function AdminLayout() {
  const { user, logout, can } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleGroups = useMemo(
    () => NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => !item.resource || can(item.resource, 'READ')) })).filter((group) => group.items.length > 0),
    [can],
  );
  const currentItem = ALL_NAV.find((item) => item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to));

  const navLink = (item) => {
    const Icon = item.icon;
    const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to);
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/admin'}
        onClick={() => setMobileOpen(false)}
        className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 ${active ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-600 hover:translate-x-0.5 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-violet-300 night:text-violet-300 night:hover:bg-violet-950/30'}`}
      >
        <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? 'text-white' : 'group-hover:scale-110'}`} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="ticks-bg relative flex min-h-screen flex-col overflow-x-hidden bg-slate-100/80 dark:bg-slate-950 night:bg-black">
      <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-morph" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl animate-float-slow" />

      <header className="glass sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/70 night:border-purple-900/20">
        <div className="relative flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-violet-300 md:hidden"><Menu className="h-5 w-5" /></button>
            <Link to="/admin" className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-600/20">Y</span>
              <span className="hidden text-sm font-extrabold tracking-tight text-slate-900 dark:text-white sm:block">Studio <span className="font-medium text-slate-400">/ Admin</span></span>
            </Link>
            <span className="hidden h-5 w-px bg-slate-200 dark:bg-slate-700 lg:block" />
            <div className="hidden min-w-0 lg:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
              <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{currentItem?.label || 'Dashboard'}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link to="/" className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-white/70 hover:text-indigo-600 sm:inline-flex dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-violet-300">View site <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            <ThemeToggle />
            <div className="hidden items-center gap-2.5 border-l border-slate-200/80 pl-3 sm:flex dark:border-slate-700/80">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-xs font-extrabold text-indigo-700 dark:bg-violet-950/60 dark:text-violet-300">{initials(user?.name)}</div>
              <div className="hidden min-w-0 lg:block"><p className="max-w-28 truncate text-xs font-bold text-slate-700 dark:text-slate-200">{user?.name}</p><p className="text-[10px] capitalize text-slate-400">{user?.role}</p></div>
            </div>
            <button type="button" onClick={logout} aria-label="Log out" className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      {mobileOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 top-16 z-30 bg-slate-950/30 backdrop-blur-sm md:hidden" />}

      <div className="relative flex flex-1">
        <aside className={`fixed inset-y-0 left-0 top-16 z-50 flex w-72 flex-col border-r border-slate-200/70 bg-white/90 px-4 py-5 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-transform duration-300 md:sticky md:top-16 md:z-20 md:h-[calc(100vh-4rem)] md:w-64 md:translate-x-0 md:border-slate-200/70 md:bg-white/65 md:shadow-none dark:border-slate-800/70 dark:bg-slate-950/90 night:border-purple-900/20 night:bg-black/90 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-5 flex items-center justify-between px-2 md:hidden"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-violet-400">Navigation</p><p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">Workspace menu</p></div><button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"><X className="h-4 w-4" /></button></div>
          <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1" aria-label="Admin navigation">
            {visibleGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{group.label}</p>
                <div className="space-y-1">{group.items.map(navLink)}</div>
              </div>
            ))}
          </nav>
          <div className="mt-5 rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 p-4 dark:border-violet-900/30 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-violet-950/30">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-600 dark:text-violet-400">Quick tip</p><p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Keep your content fresh and your next visitor impressed.</p></div><span className="text-lg">✦</span></div>
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-white/60 p-3 dark:border-slate-800/70 dark:bg-slate-900/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-extrabold text-white">{initials(user?.name)}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{user?.name || 'Administrator'}</p><p className="text-[10px] capitalize text-slate-400">{user?.role || 'admin'}</p></div>
            <button type="button" onClick={logout} aria-label="Log out" className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"><LogOut className="h-3.5 w-3.5" /></button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10"><div className="page-enter"><Outlet /></div></div>
        </main>
      </div>
    </div>
  );
}
