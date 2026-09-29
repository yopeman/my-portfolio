import { MessageSquareHeart } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { systemApi } from '../api/system.js';

export default function FeedbackPage() {
  const { data } = useAsyncResource(() => systemApi.get().then((r) => r.system), []);
  const systemId = data?._id || null;

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10 ticks-bg">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl animate-morph" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl animate-float-slow" />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <AnimatedSection>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-violet-400">
              <MessageSquareHeart className="h-3.5 w-3.5" />
              Site feedback
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Tell me what to <span className="text-gradient-primary">build next.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              One thread for the whole site. Ask for a feature, flag something broken, or leave a note on what is working.
              Sign in if you want reactions, otherwise comments post as guest.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {systemId ? (
          <AnimatedSection direction="up">
            <div className="rounded-3xl glass-subtle p-6 shadow-sm sm:p-8">
              <ReactionBar parentEntity="system" parentId={systemId} />
            </div>
            <div className="mt-8">
              <FeedbackSection parentEntity="system" parentId={systemId} />
            </div>
          </AnimatedSection>
        ) : (
          <div className="h-64 animate-shimmer rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" aria-label="Loading feedback" />
        )}
      </section>
    </PublicLayout>
  );
}
