import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowUpRight, BookOpen, Download, FileText, MessagesSquare, User } from 'lucide-react';
import { markdownComponents } from './markdownComponents';
import SlideImage from './SlideImage';
import AnimatedSection from './AnimatedSection';
import ReactionBar from './ReactionBar.jsx';
import FeedbackSection from './FeedbackSection.jsx';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { Card, SectionHeading, SectionLinkCard, SectionShell, StatTile } from './ui.jsx';

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

// Fallback only. The real start year comes from the earliest dated entry, so
// the figure stays correct without editing code every January.
const FALLBACK_START_YEAR = 2026;

function earliestYear(aboutMe) {
  const dates = [
    ...(aboutMe?.experiences || []),
    ...(aboutMe?.educations || []),
  ]
    .map((entry) => entry.startDate)
    .filter(Boolean)
    .map((value) => new Date(value).getFullYear())
    .filter((year) => Number.isFinite(year));

  return dates.length ? Math.min(...dates) : FALLBACK_START_YEAR;
}

function youtubeEmbedUrl(markdown) {
  if (!markdown) return '';
  const match =
    markdown.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
    markdown.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : '';
}

// Flattens the bio markdown down to a readable one-line teaser.
function bioSnippet(markdown, maxLength = 240) {
  if (!markdown) return '';
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength).trimEnd()}…` : plain;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

export default function About({ aboutMe, showHeading = true, showSummary = true }) {
  const images = aboutMe?.images || [];
  const documents = aboutMe?.documents || [];
  const bio = aboutMe?.about || '';

  // Total project count comes from the API meta so the full set is counted
  // without transferring every record to the browser.
  const { data: projectMeta } = useAsyncResource(
    () => projectsApi.list({ limit: 1 }).then((r) => r.meta),
    [],
  );

  const currentYear = new Date().getFullYear();
  const embedUrl = youtubeEmbedUrl(bio);
  const yearsOfExperience = Math.max(0, currentYear - earliestYear(aboutMe));
  const projectCount = projectMeta?.total ?? 0;
  const techCount = aboutMe?.skillCount ?? 0;
  const snippet = bioSnippet(bio);

  const stats = [
    { label: 'Years', end: yearsOfExperience, delay: 100 },
    { label: 'Projects', end: projectCount, delay: 240 },
    { label: 'Technologies', end: techCount, delay: 380 },
  ];

  return (
    <SectionShell id="about" tone="muted" size={images.length ? 'wide' : 'narrow'}>
      <div className={`grid items-center gap-12 ${images.length ? 'lg:grid-cols-[1fr_1.2fr] lg:gap-16' : ''}`}>
        <div className="order-2 lg:order-1">
          {showHeading && (
            <AnimatedSection>
              <SectionHeading
                eyebrow="Introduction"
                icon={User}
                title="About me"
                description="A short version, then the details: what I build, what I reach for, and the problems I keep coming back to."
              />
            </AnimatedSection>
          )}

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

          {/* Mini data + the link through to the dedicated page. */}
          {showSummary && (
            <AnimatedSection delay={160}>
              <SectionLinkCard
                icon={BookOpen}
                eyebrow="At a glance"
                title="The full profile"
                description={snippet || 'Experience, education, and background in one place.'}
                to="/about"
                linkLabel="Open the full profile"
                facts={[
                  { label: 'Years', value: `${yearsOfExperience}+` },
                  { label: 'Projects', value: `${projectCount}+` },
                  { label: 'Technologies', value: `${techCount}+` },
                ]}
              >
                {aboutMe?.experiences?.length > 0 && (
                  <p className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-extrabold uppercase tracking-[0.14em] text-slate-400">Worked at</span>
                    {aboutMe.experiences.slice(0, 4).map((experience, index) => (
                      <span
                        key={experience._id || index}
                        className="rounded-full border border-slate-200/70 px-2.5 py-1 font-semibold dark:border-slate-700/70"
                      >
                        {experience.company || experience.role}
                      </span>
                    ))}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                  </p>
                )}
              </SectionLinkCard>
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

      {documents.length > 0 && (
        <AnimatedSection className="mt-12">
          <h3 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Documents &amp; downloads
          </h3>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {documents.map((doc) => (
              <li key={doc._id || doc.url}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={doc.name}
                  className="focus-ring group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:border-violet-500/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-violet-300">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-violet-300">
                      {doc.name}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {[doc.mimeType.split('/')[1]?.toUpperCase(), formatFileSize(doc.size)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <Download
                    className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </AnimatedSection>
      )}

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
            <FeedbackSection
              parentEntity="about"
              parentId={aboutMe._id}
              limit={showSummary ? 3 : undefined}
              viewAllTo="/about"
            />
          </Card>
        </AnimatedSection>
      )}
    </SectionShell>
  );
}
