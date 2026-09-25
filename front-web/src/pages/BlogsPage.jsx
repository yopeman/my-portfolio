import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { blogsApi } from '../api/blogs.js';
import { blogToCard } from '../services/adapters.js';

const TYPE_BADGE = {
  article: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-violet-400',
  blog: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  event: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
};

export default function BlogsPage() {
  const [activeType, setActiveType] = useState('all');
  const { data, loading, error } = useAsyncResource(
    () => blogsApi.list({ limit: 100 }).then((r) => r.items),
    [],
  );
  const blogs = (data || [])
    .filter((blog) => blog.status === 'published')
    .map(blogToCard);
  const types = useMemo(
    () => ['all', ...new Set(blogs.map((blog) => blog.type).filter(Boolean))],
    [blogs],
  );
  const visibleBlogs = activeType === 'all'
    ? blogs
    : blogs.filter((blog) => blog.type === activeType);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10 ticks-bg">
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl animate-morph" />
        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <AnimatedSection>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100/80 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Notes from the workbench
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Writing about the <span className="text-gradient-primary">journey.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Articles, tutorials, and field notes on software, systems, and the small details that make a product feel complete.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={120} className="mt-10">
            <div role="tablist" aria-label="Filter posts" className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {types.map((type) => {
                const count = type === 'all' ? blogs.length : blogs.filter((blog) => blog.type === type).length;
                return (
                  <button
                    key={type}
                    type="button"
                    role="tab"
                    aria-selected={activeType === type}
                    onClick={() => setActiveType(type)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold capitalize transition-all duration-300 ${activeType === type ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20' : 'glass-subtle text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-violet-300'}`}
                  >
                    {type} <span className="ml-1 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </AnimatedSection>

          <div className="mt-10">
            {error && (
              <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                Unable to load posts from the database.
              </p>
            )}
            {loading ? (
              <div className="space-y-5" aria-label="Loading posts">
                {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-48 animate-shimmer rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" />)}
              </div>
            ) : visibleBlogs.length > 0 ? (
              <AnimatedSection stagger className="space-y-5">
                {visibleBlogs.map((blog) => (
                  <Link
                    key={blog.slug || blog.id}
                    to={`/blog/${blog.slug}`}
                    className="group block rounded-3xl glass-subtle p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300/70 hover:shadow-xl hover:shadow-indigo-500/10 sm:p-7"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${TYPE_BADGE[blog.type] || TYPE_BADGE.article}`}>
                        {blog.type}
                      </span>
                      {blog.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(blog.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {blog.readingTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {blog.readingTime} min read
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-violet-400 sm:text-2xl">
                        {blog.title}
                      </h2>
                      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-indigo-500" />
                    </div>
                    {blog.excerpt && <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{blog.excerpt}</p>}
                    {(blog.tags || []).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {blog.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-md border border-slate-200/60 bg-slate-100/70 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </AnimatedSection>
            ) : !error ? (
              <p className="rounded-2xl glass-subtle px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No posts in this category yet.</p>
            ) : null}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
