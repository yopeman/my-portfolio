import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Calendar, ChevronRight, Clock, ExternalLink } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { markdownComponents } from '../components/markdownComponents.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { blogsApi } from '../api/blogs.js';
import { blogToCard } from '../services/adapters.js';

const TYPE_STYLES = {
  article: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-violet-400',
  blog: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  event: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
};

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [progress, setProgress] = useState(0);
  const { data, loading, error } = useAsyncResource(
    () => blogsApi.bySlug(slug).then((r) => r.blog),
    [slug],
  );
  const blog = data ? blogToCard(data) : null;

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    frame = window.requestAnimationFrame(updateProgress);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (loading && !blog) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-slate-500">Loading post…</div>
      </PublicLayout>
    );
  }

  if (error && !blog) {
    return (
      <PublicLayout>
        <p role="alert" className="mx-auto max-w-3xl px-4 py-24 text-center text-rose-600 dark:text-rose-400">Unable to load this post from the database.</p>
      </PublicLayout>
    );
  }

  if (!blog) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Post not found</h1>
          <Link to="/blogs" className="mt-4 inline-block text-indigo-600 dark:text-violet-400 font-semibold">← Back to blog</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="reading-progress z-[60]" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />
      <section className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="mb-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Link to="/blogs" className="transition-colors hover:text-indigo-600 dark:hover:text-violet-400">Blog</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="max-w-[16rem] truncate text-slate-500 dark:text-slate-300">{blog.title}</span>
            </nav>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={80}>
            <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${TYPE_STYLES[blog.type] || TYPE_STYLES.article}`}>
              {blog.type}
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              {blog.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              {blog.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(blog.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {blog.readingTime > 0 && (
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {blog.readingTime} min read</span>
              )}
            </div>
            {(blog.tags || []).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {blog.tags.map((tag) => <span key={tag} className="rounded-full glass-subtle px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">{tag}</span>)}
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection direction="up" delay={160} className="mt-10">
            <div className="markdown-content max-w-none rounded-3xl glass-subtle p-6 text-base leading-relaxed text-slate-600 shadow-sm sm:p-9 dark:text-slate-300">
              <ReactMarkdown components={markdownComponents}>{blog.content || ''}</ReactMarkdown>
            </div>
           </AnimatedSection>

           {(blog.links || []).length > 0 && (
             <AnimatedSection direction="up" delay={200} className="mt-8">
               <div className="flex flex-wrap gap-2">
                 {blog.links.map((link, index) => (
                   <a key={`${link.type}-${link.link}-${index}`} href={link.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3.5 py-2 text-xs font-bold capitalize text-slate-600 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-violet-700 dark:hover:text-violet-300">
                     {link.type || 'link'} <ExternalLink className="h-3.5 w-3.5" />
                   </a>
                 ))}
               </div>
             </AnimatedSection>
           )}

           {blog._id && (

            <AnimatedSection className="mt-12 border-t border-slate-100 pt-8 dark:border-slate-800">
              <ReactionBar parentEntity="blog" parentId={blog._id} />
              <FeedbackSection parentEntity="blog" parentId={blog._id} />
            </AnimatedSection>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
