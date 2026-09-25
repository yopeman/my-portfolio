import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { blogsApi } from '../api/blogs.js';
import { blogToCard } from '../services/adapters.js';

const TYPE_BADGE = {
  article: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-violet-400',
  blog: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  event: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
};

export default function BlogsPage() {
  const { data, loading } = useAsyncResource(
    () => blogsApi.list({ limit: 100 }).then((r) => r.items),
    []
  );

  const blogs = (data || []).filter((b) => b.status === 'published').map(blogToCard);

  return (
    <PublicLayout>
      <section className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Blog
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            {loading && !data ? 'Loading…' : 'Articles, tutorials, and the occasional write-up.'}
          </p>

          <div className="mt-10 space-y-6">
            {blogs.length === 0 && !loading && (
              <p className="text-sm text-slate-400">No published posts yet — check back soon.</p>
            )}
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                to={`/blog/${blog.slug}`}
                className="block p-6 rounded-3xl bg-white dark:bg-slate-800/40 night:bg-black/40 border border-slate-200/60 dark:border-slate-800 night:border-purple-900/20 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${TYPE_BADGE[blog.type] || TYPE_BADGE.article}`}>
                    {blog.type}
                  </span>
                  {blog.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(blog.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                  )}
                  {blog.readingTime > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {blog.readingTime} min read
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-colors">
                  {blog.title}
                </h2>
                {blog.excerpt && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{blog.excerpt}</p>
                )}
                {(blog.tags || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {blog.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}