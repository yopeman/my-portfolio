import Markdown from 'markdown-to-jsx';
import { Sparkles } from 'lucide-react';
import { markdownComponents } from './markdownComponents';
import SlideImage from './SlideImage';
import AnimatedSection from './AnimatedSection';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Card, ProgressBar, SectionHeading, SectionShell } from './ui.jsx';

// Flattens markdown children back into a plain string so the trailing
// "(80%)" the adapter appends can be split off the skill name.
function toText(node) {
  if (node === null || node === undefined || node === false || node === true) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toText).join('');
  if (node?.props?.children !== undefined) return toText(node.props.children);
  return '';
}

const PROGRESS_PATTERN = /^(.*?)\s*\((\d{1,3})%\)\s*$/;

function SkillBadge({ children }) {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.2 });
  const text = toText(children);
  const match = text.match(PROGRESS_PATTERN);

  if (!match) {
    return (
      <span
        ref={ref}
        className={`chip reveal h-fit hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 ${isRevealed ? 'revealed' : ''}`}
      >
        {text}
      </span>
    );
  }

  const [, name, rawProgress] = match;
  const progress = Math.max(0, Math.min(100, Number(rawProgress)));

  return (
    <div
      ref={ref}
      className={`reveal flex h-fit w-full flex-col rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 transition-[border-color,box-shadow] duration-300 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 sm:min-w-[15rem] dark:border-slate-700/60 dark:bg-slate-800/50 night:border-purple-900/15 night:bg-black/50 ${isRevealed ? 'revealed' : ''}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{name}</span>
        <span className="counter-value text-xs font-extrabold text-indigo-600 dark:text-violet-300">{progress}%</span>
      </div>
      <ProgressBar value={progress} label={`${name} proficiency`} size="sm" className="mt-2.5" />
    </div>
  );
}

export default function Skills({ aboutMe }) {
  const images = aboutMe?.images || [];
  const skills = aboutMe?.skills || '';

  const skillsMarkdownOptions = {
    overrides: {
      ...markdownComponents,
      // The markdown already sits under a section heading.
      h1: { component: () => null },
      h2: {
        component: ({ children }) => (
          <h3 className="mt-8 mb-3 pl-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 first:mt-0 dark:text-violet-300">
            {children}
          </h3>
        ),
      },
      ul: {
        component: ({ children }) => (
          <ul className="mt-3 flex list-none flex-wrap gap-2.5 [&:first-child]:mt-0">{children}</ul>
        ),
      },
      ol: {
        component: ({ children }) => (
          <ol className="mt-3 flex list-none flex-wrap gap-2.5 [&:first-child]:mt-0">{children}</ol>
        ),
      },
      li: { component: SkillBadge },
    },
  };

  return (
    <SectionShell id="skills" size={images.length ? 'wide' : 'narrow'}>
      <div className={`grid items-start gap-12 ${images.length ? 'lg:grid-cols-[1.2fr_1fr] lg:gap-16' : ''}`}>
        <div className="order-2 lg:order-1">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Toolkit"
              icon={Sparkles}
              title={'Skills & expertise'}
              description="Languages, backend architecture, AI workflows, and the tooling that keeps shipping calm."
            />
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <Card interactive={false} className="mt-8 p-6 sm:p-8">
              {skills ? (
                <div className="text-sm">
                  <Markdown options={skillsMarkdownOptions}>{skills}</Markdown>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No skills have been added yet. Publish them from the admin dashboard to fill this section.
                </p>
              )}
            </Card>
          </AnimatedSection>
        </div>

        {images.length > 0 && (
          <AnimatedSection direction="left" delay={120} className="order-1 hidden lg:order-2 lg:block">
            <SlideImage
              images={images}
              className="aspect-[4/5] max-h-[70vh] w-full shadow-2xl shadow-indigo-950/20"
            />
          </AnimatedSection>
        )}
      </div>
    </SectionShell>
  );
}
