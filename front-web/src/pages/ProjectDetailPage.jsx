import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, ChevronRight, ExternalLink, Github, X, ZoomIn } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { markdownComponents } from '../components/markdownComponents.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard } from '../services/adapters.js';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = useAsyncResource(
    () => projectsApi.bySlug(slug).then((r) => r.project),
    [slug],
  );
  const project = data ? projectToCard(data) : null;
  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      setParallax(Math.min(window.scrollY, 900) * -0.12);
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-slate-500 dark:text-slate-400">Loading project…</div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <p role="alert" className="mx-auto max-w-3xl px-4 py-24 text-center text-rose-600 dark:text-rose-400">Unable to load this project from the database.</p>
      </PublicLayout>
    );
  }

  if (!project) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Project not found</h1>
          <Link to="/projects" className="mt-4 inline-block font-semibold text-indigo-600 dark:text-violet-400">← Back to projects</Link>
        </div>
      </PublicLayout>
    );
  }

  const images = project.images || [];
  const currentImageIndex = images.length ? Math.min(imageIndex, images.length - 1) : 0;
  const stackList = project.stacks?.length
    ? project.stacks
    : (project.tags || []).map((tag, index) => ({ name: tag, order: index }));
  const selectPrevious = () => setImageIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  const selectNext = () => setImageIndex((current) => (current + 1) % images.length);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10 ticks-bg">
        <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl animate-morph" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="mb-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Link to="/projects" className="transition-colors hover:text-indigo-600 dark:hover:text-violet-400">Projects</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="max-w-[18rem] truncate text-slate-500 dark:text-slate-300">{project.title}</span>
            </nav>
          </AnimatedSection>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <AnimatedSection direction="up" delay={80}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-violet-400">{project.type || 'project'}</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">{project.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">{project.summary}</p>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={180} className="flex flex-wrap gap-3">
              {project.repository && (
                <a href={project.repository} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"><Github className="h-4 w-4" /> Repository</a>
              )}
              {project.website && (
                <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"><ExternalLink className="h-4 w-4" /> Live demo</a>
              )}
            </AnimatedSection>
          </div>

          {images.length > 0 && (
            <AnimatedSection direction="scale" delay={220} className="mt-10">
              <div className="group relative aspect-video max-h-[520px] overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-950 shadow-2xl shadow-indigo-950/10 dark:border-slate-800">
                <button type="button" className="absolute inset-0 z-10 cursor-zoom-in" onClick={() => setLightboxOpen(true)} aria-label="Open project gallery">
                  <span className="sr-only">Open project gallery</span>
                </button>
                <img
                  src={images[currentImageIndex]}
                  alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                  className="h-full w-full object-contain transition-transform duration-500 will-change-transform group-hover:scale-[1.02]"
                  style={{ transform: `translate3d(0, ${parallax}px, 0) scale(1.06)` }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-70" />
                <div className="pointer-events-none absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"><ZoomIn className="h-3.5 w-3.5" /> View gallery</div>
                {images.length > 1 && (
                  <>
                    <button type="button" onClick={(event) => { event.stopPropagation(); selectPrevious(); }} aria-label="Previous screenshot" className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-xl border border-white/20 bg-slate-950/60 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-slate-950 group-hover:opacity-100"><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); selectNext(); }} aria-label="Next screenshot" className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-xl border border-white/20 bg-slate-950/60 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-slate-950 group-hover:opacity-100"><ChevronRight className="h-5 w-5" /></button>
                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/50 px-3 py-2 backdrop-blur-md">
                      {images.map((_, index) => <button key={index} type="button" onClick={(event) => { event.stopPropagation(); setImageIndex(index); }} aria-label={`Screenshot ${index + 1}`} className={`h-2 w-2 rounded-full transition-all ${index === currentImageIndex ? 'scale-125 bg-white' : 'bg-white/40 hover:bg-white/80'}`} />)}
                    </div>
                  </>
                )}
              </div>
            </AnimatedSection>
          )}

          <div className="mt-12 space-y-8">
            {project.problem && (
              <AnimatedSection direction="left" className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-5 dark:border-violet-500/15 dark:bg-violet-500/[0.04]">
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400">What it solves</h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.problem}</p>
              </AnimatedSection>
            )}

            {project.readme && (
              <AnimatedSection direction="up" delay={80} className="markdown-content max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <h2 className="mb-3 text-2xl font-extrabold text-slate-900 dark:text-white">Project notes</h2>
                <ReactMarkdown components={markdownComponents}>{project.readme}</ReactMarkdown>
              </AnimatedSection>
            )}

            <AnimatedSection direction="up" delay={120} className="grid gap-8 rounded-3xl glass-subtle p-6 sm:grid-cols-[1fr_auto] sm:p-8">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Tech stack</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stackList.map((stack, index) => <span key={`${stack.name}-${index}`} className="rounded-lg border border-slate-200/60 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200">{stack.name}</span>)}
                </div>
              </div>
              <div className="flex items-end gap-3 sm:flex-col sm:items-end">
                {project.repository && <a href={project.repository} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-violet-400"><Github className="h-4 w-4" /> Source</a>}
                {project.website && <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-violet-400"><ExternalLink className="h-4 w-4" /> Website</a>}
              </div>
            </AnimatedSection>

            {project._id && (
              <AnimatedSection className="border-t border-slate-100 pt-8 dark:border-slate-800">
                <ReactionBar parentEntity="project" parentId={project._id} />
                <FeedbackSection parentEntity="project" parentId={project._id} />
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {lightboxOpen && images[currentImageIndex] && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Project image gallery" onClick={() => setLightboxOpen(false)}>
          <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close gallery" className="absolute right-5 top-5 rounded-xl border border-white/20 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"><X className="h-6 w-6" /></button>
          <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col items-center gap-4" onClick={(event) => event.stopPropagation()}>
            <img src={images[currentImageIndex]} alt={`${project.title} screenshot ${currentImageIndex + 1}`} className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl" />
            {images.length > 1 && (
              <div className="flex items-center gap-3">
                <button type="button" onClick={selectPrevious} aria-label="Previous gallery image" className="rounded-xl border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button>
                <span className="text-sm font-semibold text-white/80">{currentImageIndex + 1} / {images.length}</span>
                <button type="button" onClick={selectNext} aria-label="Next gallery image" className="rounded-xl border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
