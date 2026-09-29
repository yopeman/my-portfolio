import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen } from 'lucide-react';
import { markdownComponents } from './markdownComponents';
import SlideImage from './SlideImage';
import AnimatedSection from './AnimatedSection';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import ReactionBar from './ReactionBar.jsx';
import FeedbackSection from './FeedbackSection.jsx';

function AnimatedCounter({ end, suffix, label, delay = 0 }) {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.1 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isRevealed) return undefined;
    // Guard against a non-finite target so a bad API response can't poison the counter.
    const target = Number.isFinite(end) && end > 0 ? Math.floor(end) : 0;

    let startTimestamp = null;
    let frame = null;
    const duration = 2000;
    const timer = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(easeOut * target));
        if (progress < 1) {
          frame = window.requestAnimationFrame(step);
        }
      };
      frame = window.requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      // The target can change mid-flight, so stop the old loop before a new one starts.
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [isRevealed, end, delay]);

  return (
    <div ref={ref} className="text-center p-4 glass-subtle rounded-2xl border border-slate-200/50 dark:border-white/5 night:border-purple-900/10 flex flex-col items-center hover:scale-105 transition-transform duration-300">
      <div className="text-3xl font-extrabold text-gradient-primary">
        {count}{suffix}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 font-semibold">{label}</div>
    </div>
  );
}

// Year the portfolio/engineering career began, used for the "Years" stat.
const START_YEAR = 2026;

export default function About({ aboutMe }) {
  const images = aboutMe?.images || [];

  // Total project count comes from the API meta so the full set is counted
  // without transferring every record to the browser.
  const { data: projectMeta } = useAsyncResource(
    () => projectsApi.list({ limit: 1 }).then((r) => r.meta),
    []
  );

  const currentYear = new Date().getFullYear();
  const yearsOfExperience = Math.max(0, currentYear - START_YEAR);
  const projectCount = projectMeta?.total ?? 0;
  const techCount = aboutMe?.skillCount ?? 0;

  // Extract YouTube embed URL
  const getYoutubeEmbedUrl = (markdown) => {
    if (!markdown) return '';
    const match = markdown.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
                  markdown.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : '';
  };
  const embedUrl = getYoutubeEmbedUrl(aboutMe.about);

  return (
    <section id="about" className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
      <AnimatedSection className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen grid grid-cols-1 gap-0 items-center ${images.length ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>

        {images.length > 0 && (
          <div className="hidden lg:flex items-center justify-center py-16 pr-8">
            <SlideImage
              images={images}
              className="w-full aspect-[4/5] max-h-[80vh] shadow-2xl shadow-slate-900/10 animate-float"
            />
          </div>
        )}

        {/* Right – bio + video */}
        <div className="py-20 lg:pl-16 space-y-8">
          <AnimatedSection direction="left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              About Me
            </h2>
          </AnimatedSection>

          <div className="gradient-border rounded-3xl">
            <div className="glass-subtle p-6 sm:p-8 rounded-3xl">
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed">
                <ReactMarkdown components={markdownComponents}>
                  {aboutMe.about || ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Stats Counter Area */}
          <div className="grid grid-cols-3 gap-4">
            <AnimatedCounter end={yearsOfExperience} suffix="+" label="Years" delay={100} />
            <AnimatedCounter end={projectCount} suffix="+" label="Projects" delay={300} />
            <AnimatedCounter end={techCount} suffix="+" label="Tech" delay={500} />
          </div>

          {/* YouTube embed */}
          {embedUrl && (
            <AnimatedSection direction="scale" delay={300}>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800 night:border-purple-900/20 bg-slate-900">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title="Introduction Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <BookOpen className="w-10 h-10 text-indigo-500/40" />
                    <span className="text-sm">Introduction video placeholder</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">Check out my video presentation to learn more about my coding philosophy.</p>
            </AnimatedSection>
          )}
        </div>
      </AnimatedSection>

      {/* Reactions and discussion on the profile itself */}
      {aboutMe?._id && (
        <AnimatedSection direction="up" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl glass-subtle p-6 shadow-sm sm:p-8">
            <ReactionBar parentEntity="about" parentId={aboutMe._id} />
          </div>
          <div className="mt-8">
            <FeedbackSection parentEntity="about" parentId={aboutMe._id} />
          </div>
        </AnimatedSection>
      )}
    </section>
  );
}