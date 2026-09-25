import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Calendar, Clock } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { markdownComponents } from '../components/markdownComponents.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { blogsApi } from '../api/blogs.js';
import { blogToCard } from '../services/adapters.js';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { data, loading } = useAsyncResource(
    () => blogsApi.bySlug(slug).then((r) => r.blog),
    [slug]
  );

  const blog = data ? blogToCard(data) : null;

  if (loading && !blog) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center text-slate-500">Loading…</div>
      </PublicLayout>
    );
  }

  if (!blog) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Post not found</h1>
          <Link to="/blogs" className="mt-4 inline-block text-indigo-600 dark:text-violet-400 font-semibold">
            ← Back to blog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <Link to="/blogs" className="text-sm font-semibold text-indigo-600 dark:text-violet-400 hover:underline">
            ← Back to blog
          </Link>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {blog.title}
          </h1>

          {(blog.publishedAt || blog.readingTime || blog.tags?.length) && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              {blog.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(blog.publishedAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              )}
              {blog.readingTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {blog.readingTime} min read
                </span>
              )}
              <div className="flex gap-1.5">
                {(blog.tags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 max-w-none text-base leading-relaxed text-slate-600 dark:text-slate-300">
            <ReactMarkdown components={markdownComponents}>{blog.content}</ReactMarkdown>
          </div>

          {blog._id && (
            <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-8">
              <ReactionBar parentEntity="blog" parentId={blog._id} />
              <FeedbackSection parentEntity="blog" parentId={blog._id} />
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}