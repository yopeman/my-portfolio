import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessagesSquare, User } from 'lucide-react';
import { markdownComponents } from './markdownComponents';
import SlideImage from './SlideImage';
import AnimatedSection from './AnimatedSection';
import ReactionBar from './ReactionBar.jsx';
import FeedbackSection from './FeedbackSection.jsx';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { Card, SectionHeading, SectionShell, StatTile } from './ui.jsx';

function useCountUp(target, active, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    // Guard against a non-finite target so a bad API response can't poison the counter.
    const end = Number.isFinite(target) && target > 0 ? Math.floor(target) : 0;

    let startTimestamp = null;
    let frame = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);

    return () => {
      // The target can change mid-flight, so stop the old loop before a new one starts.
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [target, active, duration]);

  return count;
}

function AnimatedStat({ end, label, delay = 0 }) {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.2 });
  const count = useCountUp(end, isRevealed);

  return (
    <div ref={ref} style={{ animationDelay: `${delay}ms` }}>
      <StatTile value={`${count}+`} label={label} />
    </div>
  );
}

// Year the portfolio/engineering career began, used for the "Years" stat.
const START_YEAR = 2026;

function youtubeEmbedUrl(markdown) {
  if (!markdown) return '';
  const match =
    markdown.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
    markdown.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : '';
}

export default function About({ aboutMe }) {
  const images = aboutMe?.images || [];
  const bio = aboutMe?.about || '';

  // Total project count comes from the API meta so the full set is counted
  // without transferring every record to the browser.
  const { data: projectMeta } = useAsyncResource(
    () => projectsApi.list({ limit: 1 }).then((r) => r.meta),
    [],
  );

  const currentYear = new Date().getFullYear();
  const embedUrl = youtubeEmbedUrl(bio);

  const stats = [
    { label: 'Years', end: Math.max(0, currentYear - START_YEAR), delay: 100 },
    { label: 'Projects', end: projectMeta?.total ?? 0, delay: 240 },
    { label: 'Technologies', end: aboutMe?.skillCount ?? 0, delay: 380 },
  ];

  return (
    <SectionShell id="about" tone="muted" size={images.length ? 'wide' : 'narrow'}>
      <div className={`grid items-center gap-12 ${images.length ? 'lg:grid-cols-[1fr_1.2fr] lg:gap-16' : ''}`}>
        <div className="order-2 lg:order-1">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Introduction"
              icon={User}
              title="About me"
              description="A short version, then the details: what I build, what I reach for, and the problems I keep coming back to."
            />
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <Card interactive={false} className="mt-8 p-6 sm:p-8">
              <div className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                {bio ? (
                  <ReactMarkdown components={markdownComponents}>{bio}</ReactMarkdown>
                ) : (
                  <p className="text-slate-400">
                    This bio has not been written yet. Add it from the admin dashboard to fill this section.
                  </p>
                )}
              </div>
            </Card>
          </AnimatedSection>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <AnimatedStat key={stat.label} {...stat} />
            ))}
          </div>

          {embedUrl && (
            <AnimatedSection direction="scale" delay={200} className="mt-10">
              <figure>
                <div className="aspect-video overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-950 shadow-2xl shadow-indigo-950/20 dark:border-slate-800">
                  <iframe
                    src={embedUrl}
                    title="Introduction video"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                <figcaption className="mt-3 text-center text-xs text-slate-400">
                  A short walkthrough of how I think about building software.
                </figcaption>
              </figure>
            </AnimatedSection>
          )}
        </div>

        {images.length > 0 && (
          <AnimatedSection direction="right" delay={120} className="order-1 hidden lg:order-2 lg:block">
            <SlideImage
              images={images}
              className="aspect-[4/5] max-h-[70vh] w-full shadow-2xl shadow-indigo-950/20"
            />
          </AnimatedSection>
        )}
      </div>

      {aboutMe?._id && (
        <AnimatedSection className="mt-20">
          <Card interactive={false} className="p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
              <MessagesSquare className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              Reactions &amp; discussion
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Leave a reaction or a note on this profile. Sign in to react; comments post as guest otherwise.
            </p>
            <div className="mt-5">
              <ReactionBar parentEntity="about" parentId={aboutMe._id} />
            </div>
            <FeedbackSection parentEntity="about" parentId={aboutMe._id} />
          </Card>
        </AnimatedSection>
      )}
    </SectionShell>
  );
}
