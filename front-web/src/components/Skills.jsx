import Markdown from 'markdown-to-jsx';
import { markdownComponents } from './markdownComponents';
import SlideImage from './SlideImage';
import AnimatedSection from './AnimatedSection';
import { useStaggerReveal } from '../hooks/useScrollReveal';

export default function Skills({ aboutMe }) {
  const images = aboutMe?.images || [];

  // Skill badge markdown options
  const skillsMarkdownOptions = {
    overrides: {
      ...markdownComponents,
      h1: { component: () => null },
      h2: {
        component: ({ children }) => (
          <h4 className="text-sm font-bold text-indigo-600 dark:text-violet-400 uppercase tracking-wider mb-3 pl-1 animate-slide-reveal">
            {children}
          </h4>
        ),
      },
      ul: {
        component: function UlComponent({ children }) {
          const { ref: staggerRef, isRevealed } = useStaggerReveal({ threshold: 0.1 });
          return (
            <div ref={staggerRef} className={`flex flex-wrap gap-2 mb-8 stagger-children ${isRevealed ? 'revealed' : ''}`}>
              {children}
            </div>
          );
        },
      },
      li: {
        component: ({ children }) => (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700/80 night:bg-purple-950/20 night:border-purple-900/10 text-slate-700 dark:text-slate-200 night:text-purple-300 border border-slate-200/50 dark:border-slate-700/60 transition-all duration-300 shadow-sm hover:scale-105 hover:shadow-indigo-500/20 glow-accent cursor-default inline-block">
            {children}
          </span>
        ),
      },
    },
  };

  return (
    <section id="skills" className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen grid grid-cols-1 gap-0 items-center ${images.length ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>

        {/* Left – skills content */}
        <div className="py-20 lg:pr-16 space-y-10">
          <AnimatedSection direction="up">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Skills &amp; Expertise
            </h2>
            <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
              Languages, backend architectures, AI workflows, and development tooling.
            </p>
          </AnimatedSection>

          <div className="gradient-border rounded-3xl">
            <div className="p-6 sm:p-8 glass-subtle backdrop-blur-sm rounded-3xl shadow-sm">
              <Markdown options={skillsMarkdownOptions}>
                {aboutMe.skills || ''}
              </Markdown>
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div className="hidden lg:flex items-center justify-center py-16 pl-8">
            <SlideImage
              images={images}
              className="w-full aspect-[4/5] max-h-[80vh] shadow-2xl shadow-slate-900/10 animate-float"
            />
          </div>
        )}
      </div>
    </section>
  );
}