import {
  Terminal, GraduationCap, Award, Calendar
} from 'lucide-react';
import SlideImage from './SlideImage';

export default function Hero({ aboutMe }) {
  const images = aboutMe?.images || [];

  return (
    <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10 ticks-bg">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen grid grid-cols-1 gap-0 items-center ${images.length ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>

        {/* Left – text */}
        <div className="py-24 sm:py-32 lg:pr-16 space-y-8 relative z-10">
          {aboutMe?.headline && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-violet-400 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" /> {aboutMe.headline}
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            Hi, I'm <span className="text-gradient-purple">Yohanes<br />Debebe</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg">
            A backend-focused software developer with strong frontend knowledge and a passion for building reliable systems.
          </p>

          {/* Academic cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 night:bg-black/60 border border-slate-200/50 dark:border-slate-700/60 backdrop-blur-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Degree</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">B.Sc. Computer Science</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 night:bg-black/60 border border-slate-200/50 dark:border-slate-700/60 backdrop-blur-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CGPA</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">3.8 / 4.0</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 night:bg-black/60 border border-slate-200/50 dark:border-slate-700/60 backdrop-blur-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Graduation</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Class of 2026</div>
              </div>
            </div>
          </div>

        </div>

        {images.length > 0 && (
          <div className="hidden lg:flex items-center justify-center py-16 pl-8">
            <SlideImage
              images={images}
              className="w-full aspect-[4/5] max-h-[80vh] shadow-2xl shadow-indigo-900/10"
            />
          </div>
        )}
      </div>
    </section>
  );
}