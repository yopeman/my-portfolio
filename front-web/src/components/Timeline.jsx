import { Briefcase, GraduationCap, MapPin, Globe, ExternalLink } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useScrollReveal } from '../hooks/useScrollReveal';

const MONTH_YEAR = { month: 'short', year: 'numeric' };

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', MONTH_YEAR);
}

// Renders "Sep 2020 – Jun 2024", collapsing either side when it is missing.
function formatRange(startDate, endDate, current) {
  const start = formatDate(startDate);
  const end = current ? 'Present' : formatDate(endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || '';
}

function EntryMeta({ location, remote }) {
  const parts = [];
  if (location) parts.push(location);
  if (remote) parts.push('Remote');
  if (!parts.length) return null;
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
      {location && (
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {location}
        </span>
      )}
      {remote && (
        <span className="inline-flex items-center gap-1">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          Remote
        </span>
      )}
    </p>
  );
}

function ExternalLinkBadge({ href }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open link"
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/60 dark:text-slate-400 dark:hover:border-violet-500/50 dark:hover:text-violet-300"
    >
      <ExternalLink className="h-3 w-3" />
      Link
    </a>
  );
}

function TimelineEntry({ entry, icon, accent, period, subtitle, children }) {
  return (
    <li className="relative pl-12 sm:pl-16">
      <span
        className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{entry.title}</h3>
          {subtitle && <p className="mt-0.5 text-sm font-semibold text-slate-600 dark:text-slate-300">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {period && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {period}
            </span>
          )}
          <ExternalLinkBadge href={entry.link} />
        </div>
      </div>
      <EntryMeta location={entry.location} remote={entry.remote} />
      {entry.description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{entry.description}</p>
      )}
      {children}
    </li>
  );
}

export default function Timeline({ aboutMe }) {
  const experiences = aboutMe?.experiences || [];
  const educations = aboutMe?.educations || [];
  const hasContent = experiences.length > 0 || educations.length > 0;
  // Each column needs its own observer: a ref can only track one element, and
  // .stagger-children keeps children at opacity 0 until the parent reveals.
  const { ref: experiencesRef, isRevealed: experiencesRevealed } = useScrollReveal({ threshold: 0.1 });
  const { ref: educationsRef, isRevealed: educationsRevealed } = useScrollReveal({ threshold: 0.1 });

  if (!hasContent) return null;

  return (
    <section id="timeline" className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-14">
        <AnimatedSection direction="up">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Experience &amp; Education
          </h2>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
            Where I have worked, what I have shipped, and how I got there.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

          {experiences.length > 0 && (
            <div>
              <AnimatedSection direction="up" delay={100}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-violet-400">
                  Experience
                </p>
                <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">Where I have worked</h3>
              </AnimatedSection>
              <ol
                ref={experiencesRef}
                className={`mt-6 space-y-8 stagger-children ${experiencesRevealed ? 'revealed' : ''}`}
              >
                {experiences.map((experience, index) => (
                  <TimelineEntry
                    key={experience._id || `experience-${index}`}
                    entry={{
                      title: experience.role || experience.company,
                      location: experience.location,
                      remote: experience.remote,
                      description: experience.description,
                      link: experience.link,
                    }}
                    icon={<Briefcase className="h-5 w-5 text-indigo-600 dark:text-violet-300" />}
                    accent="bg-indigo-50 dark:bg-indigo-950/40"
                    subtitle={
                      experience.role && experience.company ? (
                        <>
                          {experience.company}
                          {experience.type ? ` · ${experience.type}` : ''}
                        </>
                      ) : null
                    }
                    period={formatRange(experience.startDate, experience.endDate, experience.current)}
                  >
                    {(experience.highlights.length > 0 || experience.skills.length > 0) && (
                      <div className="mt-4 space-y-3">
                        {experience.highlights.length > 0 && (
                          <ul className="space-y-1.5">
                            {experience.highlights.map((highlight, index) => (
                              <li
                                key={index}
                                className="flex gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
                              >
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400" aria-hidden="true" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {experience.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {experience.skills.map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-xl border border-slate-200/60 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/60 dark:text-slate-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </TimelineEntry>
                ))}
              </ol>
            </div>
          )}

          {educations.length > 0 && (
            <div>
              <AnimatedSection direction="up" delay={200}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  Education
                </p>
                <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">How I was trained</h3>
              </AnimatedSection>
              <ol
                ref={educationsRef}
                className={`mt-6 space-y-8 stagger-children ${educationsRevealed ? 'revealed' : ''}`}
              >
                {educations.map((education, index) => (
                  <TimelineEntry
                    key={education._id || `education-${index}`}
                    entry={{
                      title: education.institution || education.degree,
                      location: education.location,
                      remote: false,
                      description: education.description,
                      link: education.link,
                    }}
                    icon={<GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />}
                    accent="bg-emerald-50 dark:bg-emerald-950/40"
                    subtitle={
                      education.degree || education.field ? (
                        <>
                          {[education.degree, education.field].filter(Boolean).join(' · ')}
                          {Number.isFinite(education.cgpa) ? ` · CGPA ${education.cgpa}` : ''}
                        </>
                      ) : null
                    }
                    period={formatRange(education.startDate, education.endDate, false)}
                  />
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
