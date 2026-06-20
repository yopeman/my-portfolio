import { useState, useEffect } from 'react';
import SlideImage from './SlideImage';
import Projects from './Projects';

export default function ProjectsSection() {
  return (
    <section id="projects" className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">

          {/* Left – sticky image panel */}
          <div className="hidden lg:block lg:sticky lg:top-24">
            <SlideImage
              className="w-full aspect-[3/4] shadow-2xl shadow-slate-900/10"
            />
            <div className="mt-6 space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Projects</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                A selection of things I've built — from AI platforms to distributed systems.
              </p>
            </div>
          </div>

          {/* Right – projects component (renders its own grid) */}
          <div>
            {/* Mobile heading */}
            <div className="lg:hidden mb-10 text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Projects</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">A selection of things I've built.</p>
            </div>
            <Projects />
          </div>
        </div>
      </div>
    </section>
  );
}