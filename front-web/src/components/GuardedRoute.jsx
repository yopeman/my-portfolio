import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const STAFF_ROLES = ['owner', 'admin', 'member'];

export default function GuardedRoute({ children, roles = STAFF_ROLES }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-500">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-bold text-slate-900 dark:text-white">Access denied</p>
        <p className="text-sm text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}