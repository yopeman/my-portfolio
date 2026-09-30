import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Layers,
  MessageSquare,
  Target,
  Youtube,
  ZoomIn,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import ProjectRequest from '../components/ProjectRequest.jsx';
import { markdownComponents } from '../components/markdownComponents.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard } from '../services/adapters.js';
import { Card, Chip, Container, Modal, Notice } from '../components/ui.jsx';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = useAsyncResource(
    () => projectsApi.bySlug(slug).then((r) => r.project),
    [slug],
  );

  const project = data ? projectToCard(data) : null;
  const images = project?.images || [];

  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Clamp rather than reset, so loading a new project does not flash image 0.
  const imageCount = images.length;
  const currentIndex = imageCount ? Math.min(imageIndex, imageCount - 1) : 0;

  const step = useCallback((delta) => {
    setImageIndex((current) => (current + delta + imageCount) % imageCount);
  }, [imageCount]);

  // Arrow keys page through the gallery from the inline viewer.
  useEffect(() => {
    if (imageCount < 2) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageCount, step]);

  if (loading) {
    return (
      <PublicLayout>
        <Container size="default" className="py-32">
          <div className="h-72 animate-shimmer rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" aria-label="Loading project" />
        </Container>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <Container size="narrow" className="py-32">
          <Notice tone="error" title="Project unavailable">
            This project could not be loaded from the database.
          </Notice>
        </Container>
      </PublicLayout>
    );
  }

  if (!project) {
    return (
      <PublicLayout>
        <Container size="narrow" className="py-32 text-center">
          <p className="eyebrow mx-auto">404</p>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Project not found
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            This project may have been renamed or removed.
          </p>
          <Link to="/projects" className="btn-primary mt-8">
            Back to projects
          </Link>
        </Container>
      </PublicLayout>
    );
  }

  const stackList = project.stacks?.length
    ? project.stacks
    : (project.tags || []).map((tag, index) => ({ name: tag, order: index }));

  return (
    <PublicLayout>
      <div className="relative isolate">
        <div className="mesh-muted absolute inset-0 -z-10" />
        <div className="grid-fade absolute inset-0 -z-10" />

        <Container size="wide" className="py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Link to="/projects" className="focus-ring rounded transition-colors hover:text-indigo-600 dark:hover:text-violet-300">
              Projects
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="max-w-[18rem] truncate text-slate-500 dark:text-slate-300">{project.title}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_auto] lg:items-end">
            <AnimatedSection>
              {project.type && <Chip tone="accent">{project.type}</Chip>}
              <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                {project.title}
              </h1>
              {project.summary && (
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  {project.summary}
                </p>
              )}
            </AnimatedSection>

            <AnimatedSection delay={100} className="flex flex-wrap gap-3">
              {project.repository && (
                <a
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  Repository
                </a>
              )}
              {project.website && (
                <a href={project.website} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Live demo
                </a>
              )}
              {project.youtube && (
                <a href={project.youtube} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <Youtube className="h-4 w-4" aria-hidden="true" />
                  Video
                </a>
              )}
            </AnimatedSection>
          </div>

          {imageCount > 0 && (
            <AnimatedSection direction="scale" delay={140} threshold={0.05} className="mt-12">
              <div className="group relative aspect-video max-h-[34rem] overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-950 shadow-2xl shadow-indigo-950/25 dark:border-slate-800">
                <img
                  src={images[currentIndex]}
                  alt={`${project.title} screenshot ${currentIndex + 1} of ${images.length}`}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"
                  aria-hidden="true"
                />

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="focus-ring absolute inset-0 cursor-zoom-in"
                  aria-label={`Open screenshot ${currentIndex + 1} in full size`}
                >
                  <span className="sr-only">Open gallery</span>
                </button>

                <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                  View full size
                </span>

                {imageCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous screenshot"
                      className="focus-ring absolute left-4 top-1/2 -translate-y-1/2 rounded-xl border border-white/20 bg-slate-950/60 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-slate-950 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next screenshot"
                      className="focus-ring absolute right-4 top-1/2 -translate-y-1/2 rounded-xl border border-white/20 bg-slate-950/60 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-slate-950 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/50 px-3 py-2 backdrop-blur-md">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setImageIndex(index)}
                          aria-label={`Show screenshot ${index + 1}`}
                          aria-current={index === currentIndex}
                          className={`h-2 w-2 rounded-full transition-all ${
                            index === currentIndex ? 'scale-125 bg-white' : 'bg-white/40 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </AnimatedSection>
          )}

          <div className="mt-14 space-y-10">
            {project.problem && (
              <AnimatedSection direction="left">
                <Card interactive={false} className="border-indigo-500/20 bg-indigo-500/[0.05] p-6 dark:border-violet-500/20 dark:bg-violet-500/[0.06]">
                  <h2 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-600 dark:text-violet-300">
                    <Target className="h-4 w-4" aria-hidden="true" />
                    What it solves
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                    {project.problem}
                  </p>
                </Card>
              </AnimatedSection>
            )}

            {project.readme && (
              <AnimatedSection delay={60}>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Project notes
                </h2>
                <div className="markdown-content mt-5 max-w-none text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                  <ReactMarkdown components={markdownComponents}>{project.readme}</ReactMarkdown>
                </div>
              </AnimatedSection>
            )}

            {stackList.length > 0 && (
              <AnimatedSection delay={100}>
                <Card interactive={false} className="p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                    Tech stack
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {stackList.map((stack, index) => (
                      <li key={`${stack.name}-${index}`}>
                        <Chip>{stack.name}</Chip>
                      </li>
                    ))}
                  </ul>
                </Card>
              </AnimatedSection>
            )}

            {project._id && (
              <AnimatedSection delay={140}>
                <ProjectRequest project={project} />
              </AnimatedSection>
            )}

            {project._id && (
              <AnimatedSection className="border-t border-slate-200/60 pt-10 dark:border-slate-800/60">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
                  <MessageSquare className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                  Reactions &amp; discussion
                </h2>
                <div className="mt-5">
                  <ReactionBar parentEntity="project" parentId={project._id} />
                </div>
                <FeedbackSection parentEntity="project" parentId={project._id} />
              </AnimatedSection>
            )}
          </div>
        </Container>
      </div>

      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={`${project.title} gallery`}
        bare
      >
        {images[currentIndex] && (
          <div className="flex w-full max-w-6xl flex-col items-center gap-5">
            <img
              src={images[currentIndex]}
              alt={`${project.title} screenshot ${currentIndex + 1} of ${images.length}`}
              className="max-h-[74vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {imageCount > 1 && (
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white/20">
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="text-sm font-semibold text-white/80">
                  {currentIndex + 1} / {imageCount}
                </span>
                <button type="button" onClick={() => step(1)} aria-label="Next image" className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white/20">
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
            <button type="button" onClick={() => setLightboxOpen(false)} className="btn-secondary border-white/20 bg-white/10 text-white">
              Close gallery
            </button>
          </div>
        )}
      </Modal>
    </PublicLayout>
  );
}
