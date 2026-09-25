import { useRef, useState } from 'react';
import { Terminal, GraduationCap, Award, Calendar, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import SlideImage from './SlideImage';
import ParticleCanvas from './ParticleCanvas';
import useTypingEffect from '../hooks/useTypingEffect';
import AnimatedSection from './AnimatedSection';

const ROLES = ['Software Developer', 'Full-Stack Engineer', 'Backend Specialist', 'Open Source Enthusiast'];

function MagneticLink({ href, children, className = '', secondary = false }) {
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
    window.setTimeout(() => setRipples((current) => current.filter((ripple) => ripple.id !== id)), 650);
  };

  return (
    <a
      ref={linkRef}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={{ transform }}
      className={`btn-ripple group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300 ${secondary ? 'glass text-slate-700 hover:-translate-y-0.5 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-violet-400' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-500/25'} ${className}`}
    >
      {ripples.map((ripple) => <span key={ripple.id} className="ripple-effect" style={{ left: ripple.x, top: ripple.y }} />)}
      <span className="relative z-10">{children}</span>
    </a>
  );
}

export default function Hero({ aboutMe }) {
  const images = aboutMe?.images || [];
  const typingText = useTypingEffect(ROLES, { typingSpeed: 100, pauseDuration: 2000 });

  return (
    <section className="relative overflow-hidden border-b border-slate-100 ticks-bg dark:border-slate-800 night:border-purple-900/10">
      <div className="absolute inset-0 z-0 opacity-50"><ParticleCanvas /></div>
      <div className="deco-shape animate-float absolute -left-10 -top-10 z-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-violet-500/10" />
      <div className="deco-shape animate-float-slow absolute bottom-10 right-10 z-0 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl dark:bg-fuchsia-500/10" />

      <div className={`relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-0 px-4 sm:px-6 lg:px-8 ${images.length ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>
        <div className="relative z-10 space-y-8 py-24 sm:py-32 lg:pr-16">
          <AnimatedSection delay={0}>
            {aboutMe?.headline && (
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100/50 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm dark:border-indigo-900/30 dark:bg-indigo-950/40 dark:text-violet-400">
                <Terminal className="h-3.5 w-3.5" /> {aboutMe.headline}
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h1 className="text-4xl font-extrabold leading-none tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Hi, I’m <span className="text-gradient-primary">Yohanes<br />Debebe</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="flex h-8 max-w-lg items-center text-lg font-medium text-slate-600 dark:text-slate-300 sm:text-xl">
              A {typingText.text}<span className="ml-0.5 animate-cursor-blink text-indigo-500">|</span>
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
              I turn ambitious ideas into dependable products — from backend architecture and AI systems to interfaces that feel effortless.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={280} className="flex flex-wrap gap-3">
            <MagneticLink href="#about">Explore my work <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></MagneticLink>
            <MagneticLink href="#contact" secondary>Let’s talk <Sparkles className="h-4 w-4" /></MagneticLink>
          </AnimatedSection>

          <AnimatedSection delay={360}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="gradient-border flex items-center gap-3 rounded-2xl border border-slate-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 dark:border-slate-700/60 dark:bg-slate-800/60 night:bg-black/60">
                <div className="shrink-0 rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"><GraduationCap className="h-5 w-5" /></div>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Degree</div><div className="text-xs font-bold text-slate-800 dark:text-slate-100">B.Sc. Computer Science</div></div>
              </div>
              <div className="gradient-border flex items-center gap-3 rounded-2xl border border-slate-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 dark:border-slate-700/60 dark:bg-slate-800/60 night:bg-black/60">
                <div className="shrink-0 rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"><Award className="h-5 w-5" /></div>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-slate-400">CGPA</div><div className="text-xs font-bold text-slate-800 dark:text-slate-100">3.8 / 4.0</div></div>
              </div>
              <div className="gradient-border flex items-center gap-3 rounded-2xl border border-slate-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 dark:border-slate-700/60 dark:bg-slate-800/60 night:bg-black/60">
                <div className="shrink-0 rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"><Calendar className="h-5 w-5" /></div>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Graduation</div><div className="text-xs font-bold text-slate-800 dark:text-slate-100">Class of 2026</div></div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {images.length > 0 && (
          <AnimatedSection delay={440} className="hidden items-center justify-center py-16 pl-8 lg:flex">
            <SlideImage images={images} className="aspect-[4/5] max-h-[80vh] w-full overflow-hidden rounded-2xl shadow-2xl shadow-indigo-900/10" />
          </AnimatedSection>
        )}
      </div>

      <a href="#about" className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center justify-center text-slate-400 opacity-80 transition-colors hover:text-indigo-500 dark:text-slate-500">
        <span className="mb-1 text-[10px] font-bold uppercase tracking-widest">Scroll</span>
        <ChevronDown className="animate-scroll-bounce h-5 w-5" />
      </a>
    </section>
  );
}
