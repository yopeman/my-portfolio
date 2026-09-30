import { useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleCanvas from './ParticleCanvas';
import SlideImage from './SlideImage';
import AnimatedSection from './AnimatedSection';
import useTypingEffect from '../hooks/useTypingEffect';

const ROLES = ['Software Developer', 'Full-Stack Engineer', 'Backend Specialist', 'Open Source Enthusiast'];

// Ripple + magnetic pull on a primary call to action.
function MagneticLink({ to, children, className = '', ...rest }) {
  const linkRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [ripples, setRipples] = useState([]);

  const handleMove = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = linkRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    setTransform(`translate(${x * 0.12}px, ${y * 0.12}px)`);
  };

  const handleLeave = () => setTransform('');

  const handleClick = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = linkRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = Date.now();
    setRipples((current) => [...current, { id, x: event.clientX - rect.left, y: event.clientY - rect.top }]);
    window.setTimeout(() => setRipples((current) => current.filter((r) => r.id !== id)), 650);
  };

  return (
    <Link
      ref={linkRef}
      to={to}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={{ transform }}
      className={`btn-ripple group relative inline-flex items-center justify-center gap-2 overflow-hidden ${className}`}
      {...rest}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      ))}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Link>
  );
}

function FactTile({ icon: Icon, label, value, accentClass, delay }) {
  if (!value) return null;
  return (
    <div
      className="animate-pop flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 dark:border-slate-700/60 dark:bg-slate-800/60 night:border-purple-900/15 night:bg-black/60"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClass}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{label}</span>
        <span className="mt-0.5 block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{value}</span>
      </span>
    </div>
  );
}

// These facts are read from the education record so the hero never drifts
// out of sync with the timeline further down the page.
function useHeroFacts(aboutMe) {
  const education = aboutMe?.educations?.[0];
  const degree = [education?.degree, education?.field].filter(Boolean).join(' · ');
  const graduationYear = education?.endDate ? new Date(education.endDate).getFullYear() : null;

  return [
    {
      key: 'degree',
      label: 'Degree',
      value: degree,
      icon: GraduationCap,
      accent: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
    },
    {
      key: 'cgpa',
      label: 'CGPA',
      value: Number.isFinite(education?.cgpa) ? `${education.cgpa} / 4.0` : '',
      icon: Award,
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
    {
      key: 'graduation',
      label: 'Graduation',
      value: graduationYear ? `Class of ${graduationYear}` : '',
      icon: CalendarDays,
      accent: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300',
    },
  ].filter((fact) => fact.value);
}

export default function Hero({ aboutMe }) {
  const images = aboutMe?.images || [];
  const typingText = useTypingEffect(ROLES, { typingSpeed: 100, pauseDuration: 2000 });
  const facts = useHeroFacts(aboutMe);

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60 night:border-purple-900/10">
      <div className="mesh-hero absolute inset-0 -z-10" />
      <div className="grid-fade absolute inset-0 -z-10" />
      <div className="noise-overlay absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true">
        <ParticleCanvas />
      </div>
      <div className="aurora-blob -left-24 -top-32 h-[26rem] w-[26rem] bg-indigo-500/25 dark:bg-violet-500/20" />
      <div className="aurora-blob -bottom-32 -right-24 h-[22rem] w-[22rem] bg-fuchsia-500/20 [animation-delay:-9s]" />

      <div
        className={`relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-8xl grid-cols-1 items-center px-4 sm:px-6 lg:px-8 ${
          images.length ? 'lg:grid-cols-2 lg:gap-12' : ''
        }`}
      >
        <div className="py-16 sm:py-20 lg:py-24">
          {aboutMe?.headline && (
            <AnimatedSection delay={0}>
              <p className="eyebrow animate-pop">
                <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                {aboutMe.headline}
              </p>
            </AnimatedSection>
          )}

          <AnimatedSection delay={80}>
            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[0.95] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              Hi, I&rsquo;m{' '}
              <span className="text-gradient-primary">
                Yohanes
                <br />
                Debebe
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={160}>
            <p className="mt-8 flex h-8 max-w-lg items-center text-lg font-medium text-slate-600 dark:text-slate-300 sm:text-xl">
              <span className="truncate">
                A <span className="text-slate-900 dark:text-white">{typingText.text}</span>
              </span>
              <span className="ml-0.5 animate-cursor-blink text-indigo-500" aria-hidden="true">|</span>
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
              I turn ambitious ideas into dependable products — from backend architecture and AI systems to
              interfaces that feel effortless.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={240} className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticLink to="/projects" className="btn-primary px-6 py-3.5 text-sm">
              Explore my work
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </MagneticLink>
            <MagneticLink to="/contact" className="btn-secondary px-6 py-3.5 text-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Let&rsquo;s talk
            </MagneticLink>
          </AnimatedSection>

          {facts.length > 0 && (
            <AnimatedSection delay={320} className="mt-12">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {facts.map((fact, index) => (
                  <FactTile key={fact.key} {...fact} delay={index * 90} />
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>

        {images.length > 0 && (
          <AnimatedSection delay={400} className="hidden items-center justify-center py-16 lg:flex">
            <SlideImage
              images={images}
              className="aspect-[4/5] max-h-[78vh] w-full overflow-hidden rounded-3xl shadow-2xl shadow-indigo-950/20"
            />
          </AnimatedSection>
        )}
      </div>

      <Link
        to="/#about"
        className="focus-ring absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center justify-center rounded-2xl px-3 py-2 text-slate-400 transition-colors hover:text-indigo-500 sm:flex"
      >
        <span className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className="animate-scroll-bounce h-5 w-5" aria-hidden="true" />
      </Link>
    </section>
  );
}
