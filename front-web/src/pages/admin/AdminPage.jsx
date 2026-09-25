import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function AdminPage() {
  const { user, logout, can } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 night:bg-slate-950">
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 night:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-bold text-slate-900 dark:text-white">
              ← Back to site
            </Link>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-violet-400">Admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {user?.name} <span className="text-xs">({user?.role})</span>
            </span>
            {can('users', 'CREATE') && (
              <Link to="/admin/users" className="text-indigo-600 dark:text-violet-400 font-semibold">
                Users
              </Link>
            )}
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Full CRUD dashboard arrives in Phase 9. The data layer and guarded routing are in place.
        </p>
      </main>
    </div>
  );
}