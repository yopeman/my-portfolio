import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, FileText, Inbox, Users, Mail,
  UserRound, CalendarRange, ImageIcon, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 night:bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 night:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Site
            </Link>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-violet-400">Admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:block text-slate-500 dark:text-slate-400">
              {user?.name} <span className="text-xs">({user?.role})</span>
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-56 shrink-0 bg-white dark:bg-slate-900 night:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:block">
          <nav className="p-3 space-y-1 sticky top-16">
            {NAV.filter((item) => !item.resource || can(item.resource, 'READ')).map((item) => {
              const Icon = item.icon;
              const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}