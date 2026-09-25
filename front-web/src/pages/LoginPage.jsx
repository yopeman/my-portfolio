import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ActionButton, Field, TextInput } from '../components/admin/form.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 dark:bg-slate-950 night:bg-black sm:px-6">
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/75 night:border-purple-900/20 night:bg-black/75 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-9 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[28px] border-white/10" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><Sparkles className="h-5 w-5" /></div><p className="mt-12 text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-100">Studio workspace</p><h1 className="mt-3 text-3xl font-extrabold tracking-tight">Make your best work feel effortless.</h1><p className="mt-4 max-w-xs text-sm leading-relaxed text-indigo-100/80">A calm, focused space to keep your portfolio fresh, current, and ready for the next visitor.</p></div>
          <div className="relative flex items-center gap-3 text-xs font-semibold text-indigo-100/80"><ShieldCheck className="h-4 w-4" /> Secure workspace access</div>
        </div>
        <div className="p-6 sm:p-9 lg:p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:-translate-x-0.5 hover:text-indigo-600 dark:hover:text-violet-300"><ArrowLeft className="h-3.5 w-3.5" /> Back to site</Link>
          <div className="mt-10"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><LockKeyhole className="h-5 w-5" /></div><h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">Welcome back</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to continue to your workspace.</p></div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <Field label="Email address" required><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" autoFocus /></Field>
            <Field label="Password" required>
              <div className="relative"><TextInput type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" className="pr-11" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </Field>
            <ActionButton type="submit" loading={submitting} className="w-full">{submitting ? 'Signing in…' : 'Sign in to workspace'}</ActionButton>
          </form>
          <p className="mt-7 text-center text-xs text-slate-400">Need access? Contact the workspace owner.</p>
        </div>
      </div>
    </div>
  );
}
