import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { CalendarDays, ChevronRight, Clock, ExternalLink, MessageSquare, PenLine } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { markdownComponents } from '../components/markdownComponents.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { blogsApi } from '../api/blogs.js';
import { blogToCard } from '../services/adapters.js';
import { Card, Chip, Container, Notice } from '../components/ui.jsx';

const TYPE_TONE = {
  article: 'accent',
  blog: 'emerald',
  event: 'amber',
};

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

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
        <Container size="narrow" className="py-32">
          <div className="h-96 animate-shimmer rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" aria-label="Loading post" />
        </Container>
      </PublicLayout>
    );
  }

  if (error && !blog) {
    return (
      <PublicLayout>
        <Container size="narrow" className="py-32">
          <Notice tone="error" title="Post unavailable">
            This post could not be loaded from the database.
          </Notice>
        </Container>
      </PublicLayout>
    );
  }

  if (!blog) {
    return (
      <PublicLayout>
        <Container size="narrow" className="py-32 text-center">
          <p className="eyebrow mx-auto">404</p>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Post not found
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            This post may have been unpublished or renamed.
          </p>
          <Link to="/blogs" className="btn-primary mt-8">
            Back to blog
          </Link>
        </Container>
      </PublicLayout>
    );
  }

  const published = formatDate(blog.publishedAt);
  const links = blog.links || [];

  return (
    <PublicLayout>
      <div className="reading-progress" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />

      <div className="relative isolate">
        <div className="mesh-muted absolute inset-0 -z-10" />

        <Container size="wide" className="py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Link to="/blogs" className="focus-ring rounded transition-colors hover:text-indigo-600 dark:hover:text-violet-300">
              Blog
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="max-w-[16rem] truncate text-slate-500 dark:text-slate-300">{blog.title}</span>
          </nav>

          <AnimatedSection className="mt-8">
            <Chip tone={TYPE_TONE[blog.type] || 'neutral'} icon={PenLine}>
              {blog.type}
            </Chip>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {blog.title}
            </h1>

            {(published || blog.readingTime > 0) && (
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                {published && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {published}
                  </span>
                )}
                {blog.readingTime > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {blog.readingTime} min read
                  </span>
                )}
              </div>
            )}

            {blog.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <li key={tag}>
                    <Chip>{tag}</Chip>
                  </li>
                ))}
              </ul>
            )}
          </AnimatedSection>

          <AnimatedSection delay={80} className="mt-12">
            <Card interactive={false} className="p-6 sm:p-10">
              <div className="markdown-content max-w-none text-[16px] leading-[1.75] text-slate-600 dark:text-slate-300">
                {blog.content ? (
                  <ReactMarkdown components={markdownComponents}>{blog.content}</ReactMarkdown>
                ) : (
                  <p className="text-slate-400">This post has no content yet.</p>
                )}
              </div>
            </Card>
          </AnimatedSection>

          {links.length > 0 && (
            <AnimatedSection delay={120} className="mt-8">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Links in this post
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {links.map((link, index) => (
                  <li key={`${link.type}-${link.link}-${index}`}>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-3.5 py-2 text-xs capitalize"
                    >
                      {link.type || 'link'}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          )}

          {blog._id && (
            <AnimatedSection className="mt-16 border-t border-slate-200/60 pt-10 dark:border-slate-800/60">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
                <MessageSquare className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                Reactions &amp; discussion
              </h2>
              <div className="mt-5">
                <ReactionBar parentEntity="blog" parentId={blog._id} />
              </div>
              <FeedbackSection parentEntity="blog" parentId={blog._id} />
            </AnimatedSection>
          )}
        </Container>
      </div>
    </PublicLayout>
  );
}
