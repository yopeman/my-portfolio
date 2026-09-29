import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Field, Notice, TextInput } from '../components/ui.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
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
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="mesh-hero absolute inset-0 -z-20" />
      <div className="grid-fade absolute inset-0 -z-20" />
      <div className="noise-overlay absolute inset-0 -z-20" />
      <div className="aurora-blob -left-32 -top-32 h-96 w-96 bg-indigo-500/20" />
      <div className="aurora-blob -bottom-32 -right-24 h-96 w-96 bg-fuchsia-500/15 [animation-delay:-7s]" />

      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-900/75 night:border-purple-900/20 night:bg-black/75 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[28px] border-white/10" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-12 text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-100">
              Studio workspace
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">
              Make your best work feel effortless.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-indigo-100/80">
              A calm, focused space to keep your portfolio fresh, current, and ready for the next visitor.
            </p>
          </div>
          <p className="relative flex items-center gap-3 text-xs font-semibold text-indigo-100/80">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Secure workspace access
          </p>
        </div>

        <div className="p-6 sm:p-9 lg:p-12">
          <Link
            to="/"
            className="focus-ring inline-flex items-center gap-2 rounded text-xs font-bold text-slate-400 transition hover:-translate-x-0.5 hover:text-indigo-600 dark:hover:text-violet-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to site
          </Link>

          <div className="mt-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to continue to your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <Notice tone="error">{error}</Notice>}

            <Field id="login-email" label="Email address" required>
              <TextInput
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </Field>

            <Field id="login-password" label="Password" required>
              <div className="relative">
                <TextInput
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </Field>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
              {submitting ? 'Signing in…' : 'Sign in to workspace'}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-slate-400">
            Need access? Contact the workspace owner.
          </p>
        </div>
      </div>
    </div>
  );
}
