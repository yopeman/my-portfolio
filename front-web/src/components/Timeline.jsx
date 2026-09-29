import { Briefcase, ExternalLink, Globe, GraduationCap, MapPin } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Chip, SectionHeading, SectionShell } from './ui.jsx';

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
  if (!location && !remote) return null;
  return (
    <ul className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
      {location && (
        <li className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {location}
        </li>
      )}
      {remote && (
        <li className="inline-flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Remote
        </li>
      )}
    </ul>
  );
}

function TimelineEntry({ title, subtitle, period, link, icon, accent, children }) {
  return (
    <li className="relative pl-12 sm:pl-14">
      <span className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`} aria-hidden="true">
        {icon}
      </span>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {period && <Chip>{period}</Chip>}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open link for ${title}`}
              className="focus-ring inline-flex items-center gap-1 rounded-full border border-slate-200/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/70 dark:text-slate-400 dark:hover:border-violet-500/50 dark:hover:text-violet-300"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              Link
            </a>
          )}
        </div>
      </div>
      {children}
    </li>
  );
}

export default function Timeline({ aboutMe }) {
  const experiences = aboutMe?.experiences || [];
  const educations = aboutMe?.educations || [];
  const hasContent = experiences.length > 0 || educations.length > 0;

  // Each column needs its own observer: a ref can only track one element.
  const { ref: experiencesRef, isRevealed: experiencesRevealed } = useScrollReveal({ threshold: 0.1 });
  const { ref: educationsRef, isRevealed: educationsRevealed } = useScrollReveal({ threshold: 0.1 });

  if (!hasContent) return null;

  return (
    <SectionShell id="timeline" size="wide">
      <AnimatedSection>
        <SectionHeading
          eyebrow="Trajectory"
          icon={Briefcase}
          title={'Experience & education'}
          description="Where I have worked, what I have shipped, and the study that got me there."
        />
      </AnimatedSection>

      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
        {experiences.length > 0 && (
          <section>
            <AnimatedSection direction="up" delay={80}>
              <div className="mb-7 flex items-center gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-800/70">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Briefcase className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Experience
                </h3>
                <Chip tone="accent" className="ml-auto">
                  {experiences.length} {experiences.length === 1 ? 'role' : 'roles'}
                </Chip>
              </div>
            </AnimatedSection>

            <ol
              ref={experiencesRef}
              className={`stagger-children relative space-y-8 before:absolute before:bottom-2 before:left-5 before:top-2 before:w-px before:bg-gradient-to-b before:from-indigo-400/60 before:to-transparent sm:before:left-5 ${experiencesRevealed ? 'revealed' : ''}`}
            >
              {experiences.map((experience, index) => (
                <TimelineEntry
                  key={experience._id || `experience-${index}`}
                  title={experience.role || experience.company}
                  subtitle={
                    experience.role && experience.company ? (
                      <span>
                        {experience.company}
                        {experience.type ? ` · ${experience.type}` : ''}
                      </span>
                    ) : null
                  }
                  period={formatRange(experience.startDate, experience.endDate, experience.current)}
                  link={experience.link}
                  icon={<Briefcase className="h-5 w-5 text-indigo-600 dark:text-violet-300" aria-hidden="true" />}
                  accent="bg-indigo-50 dark:bg-indigo-500/15"
                >
                  <div className="mt-4 space-y-3">
                    {experience.description && (
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {experience.description}
                      </p>
                    )}
                    <EntryMeta location={experience.location} remote={experience.remote} />
                    {experience.highlights.length > 0 && (
                      <ul className="space-y-1.5">
                        {experience.highlights.map((highlight, highlightIndex) => (
                          <li
                            key={highlightIndex}
                            className="flex gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
                          >
                            <span
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                              aria-hidden="true"
                            />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {experience.skills.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5">
                        {experience.skills.map((skill, skillIndex) => (
                          <li key={`${skill}-${skillIndex}`}>
                            <Chip>{skill}</Chip>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </TimelineEntry>
              ))}
            </ol>
          </section>
        )}

        {educations.length > 0 && (
          <section>
            <AnimatedSection direction="up" delay={160}>
              <div className="mb-7 flex items-center gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-800/70">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <GraduationCap className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Education
                </h3>
                <Chip tone="emerald" className="ml-auto">
                  {educations.length} {educations.length === 1 ? 'program' : 'programs'}
                </Chip>
              </div>
            </AnimatedSection>

            <ol
              ref={educationsRef}
              className={`stagger-children relative space-y-8 before:absolute before:bottom-2 before:left-5 before:top-2 before:w-px before:bg-gradient-to-b before:from-emerald-400/60 before:to-transparent ${educationsRevealed ? 'revealed' : ''}`}
            >
              {educations.map((education, index) => (
                <TimelineEntry
                  key={education._id || `education-${index}`}
                  title={education.institution || education.degree}
                  subtitle={
                    [education.degree, education.field].filter(Boolean).join(' · ') ||
                    null
                  }
                  period={formatRange(education.startDate, education.endDate, false)}
                  link={education.link}
                  icon={<GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />}
                  accent="bg-emerald-50 dark:bg-emerald-500/15"
                >
                  <div className="mt-4 space-y-3">
                    {education.description && (
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {education.description}
                      </p>
                    )}
                    <EntryMeta location={education.location} remote={false} />
                    {Number.isFinite(education.cgpa) && (
                      <div className="flex flex-wrap gap-1.5">
                        <Chip tone="emerald">CGPA {education.cgpa}</Chip>
                      </div>
                    )}
                  </div>
                </TimelineEntry>
              ))}
            </ol>
          </section>
        )}
      </div>
    </SectionShell>
  );
}
