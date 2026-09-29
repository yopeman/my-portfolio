import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Clock, PenLine } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { blogsApi } from '../api/blogs.js';
import { blogToCard } from '../services/adapters.js';
import { Chip, EmptyState, Notice, PageHeader, SectionShell, Skeleton } from '../components/ui.jsx';

const FILTER_LABELS = {
  all: 'Everything',
};

const TYPE_TONE = {
  article: 'accent',
  blog: 'emerald',
  event: 'amber',
};

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BlogsPage() {
  const [activeType, setActiveType] = useState('all');
  const { data, loading, error } = useAsyncResource(
    () => blogsApi.list({ limit: 100 }).then((r) => r.items),
    [],
  );

  const blogs = useMemo(
    () => (data || []).filter((blog) => blog.status === 'published').map(blogToCard),
    [data],
  );

  const types = useMemo(() => {
    const seen = new Set();
    for (const blog of blogs) {
      if (blog.type) seen.add(blog.type);
    }
    return ['all', ...seen];
  }, [blogs]);

  const counts = useMemo(() => {
    const map = { all: blogs.length };
    for (const blog of blogs) {
      if (blog.type) map[blog.type] = (map[blog.type] || 0) + 1;
    }
    return map;
  }, [blogs]);

  const visibleBlogs = activeType === 'all'
    ? blogs
    : blogs.filter((blog) => blog.type === activeType);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Blog"
        icon={PenLine}
        title="Writing about"
        highlight="the journey."
        description="Articles, tutorials, and field notes on software, systems, and the small details that make a product feel complete."
      >
        {types.length > 1 && (
          <div role="tablist" aria-label="Filter posts by type" className="mt-10 flex max-w-full gap-2 overflow-x-auto pb-2">
            {types.map((type) => {
              const selected = activeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveType(type)}
                  className={`focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition-all duration-300 ${
                    selected
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'border border-slate-200/70 bg-white/70 text-slate-600 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300'
                  }`}
                >
                  {FILTER_LABELS[type] || type}
                  <span className={`ml-1.5 ${selected ? 'opacity-70' : 'opacity-50'}`}>
                    {counts[type] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </PageHeader>

      <SectionShell size="narrow" divider={false}>
        {error && (
          <Notice tone="error" className="mb-10" title="Posts unavailable">
            The blog list could not be loaded from the database.
          </Notice>
        )}

        {loading ? (
          <div className="space-y-5" aria-label="Loading posts">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-56" />
            ))}
          </div>
        ) : visibleBlogs.length > 0 ? (
          <AnimatedSection stagger className="space-y-5">
            {visibleBlogs.map((blog) => {
              const published = formatDate(blog.publishedAt);
              return (
                <article key={blog._id || blog.slug} className="card-surface card-surface-tight group">
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="focus-ring block rounded-2xl p-6 sm:p-7"
                    aria-label={`Read ${blog.title}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone={TYPE_TONE[blog.type] || 'neutral'}>{blog.type}</Chip>
                      {published && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <CalendarDays className="h-3 w-3" aria-hidden="true" />
                          {published}
                        </span>
                      )}
                      {blog.readingTime > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {blog.readingTime} min read
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-4">
                      <h2 className="text-xl font-extrabold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-violet-300 sm:text-2xl">
                        {blog.title}
                      </h2>
                      <ArrowUpRight
                        className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500"
                        aria-hidden="true"
                      />
                    </div>

                    {blog.excerpt && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {blog.excerpt}
                      </p>
                    )}

                    {blog.tags.length > 0 && (
                      <ul className="mt-5 flex flex-wrap gap-1.5">
                        {blog.tags.slice(0, 4).map((tag) => (
                          <li key={tag}>
                            <Chip>{tag}</Chip>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Link>
                </article>
              );
            })}
          </AnimatedSection>
        ) : !error ? (
          <EmptyState
            icon={PenLine}
            title={activeType === 'all' ? 'No posts published yet' : `Nothing in ${activeType} yet`}
            description={
              activeType === 'all'
                ? 'Articles published from the admin dashboard will appear here.'
                : 'Try another filter to see everything that has been written.'
            }
            action={
              activeType !== 'all' ? (
                <button type="button" onClick={() => setActiveType('all')} className="btn-secondary">
                  Show everything
                </button>
              ) : null
            }
          />
        ) : null}
      </SectionShell>
    </PublicLayout>
  );
}
