import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Clock, PenLine } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { blogsApi } from '../api/blogs.js';
import { blogToCard } from '../services/adapters.js';
import { ButtonLink, Chip, SectionHeading, SectionShell, Skeleton } from './ui.jsx';

const PREVIEW_LIMIT = 3;

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

export default function WritingSection() {
  const { data, loading } = useAsyncResource(
    () => blogsApi.list({ limit: PREVIEW_LIMIT }).then((r) => r.items),
    [],
  );

  const posts = (data || [])
    .filter((blog) => blog.status === 'published')
    .map(blogToCard);

  // Nothing to show and nothing to show while loading — do not render a stub.
  if (!loading && posts.length === 0) return null;

  return (
    <SectionShell id="writing" size="wide" tone="muted">
      <AnimatedSection>
        <SectionHeading
          eyebrow="Writing"
          icon={PenLine}
          title="Notes from the workbench"
          description="Field notes on backend design, AI systems, and the small details that make a product feel finished."
        >
          <ButtonLink to="/blogs" variant="secondary" size="sm" className="mt-6">
            Read the blog
          </ButtonLink>
        </SectionHeading>
      </AnimatedSection>

      <div className="mt-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3" aria-label="Loading posts">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-56" />
            ))}
          </div>
        ) : (
          <AnimatedSection stagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {posts.map((post) => {
              const published = formatDate(post.publishedAt);
              return (
                <article
                  key={post._id || post.slug}
                  className="card-surface card-surface-tight group flex flex-col p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone={TYPE_TONE[post.type] || 'neutral'}>{post.type}</Chip>
                    {published && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <CalendarDays className="h-3 w-3" aria-hidden="true" />
                        {published}
                      </span>
                    )}
                    {post.readingTime > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {post.readingTime} min
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-violet-300">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {post.excerpt}
                    </p>
                  )}

                  <Link
                    to={`/blog/${post.slug}`}
                    className="focus-ring mt-auto inline-flex items-center gap-1 pt-5 text-xs font-extrabold text-indigo-600 dark:text-violet-300"
                    aria-label={`Read ${post.title}`}
                  >
                    Read
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              );
            })}
          </AnimatedSection>
        )}
      </div>
    </SectionShell>
  );
}
