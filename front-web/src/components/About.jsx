import { useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';
import { BookOpen } from 'lucide-react';
import { markdownOverrides } from './markdownComponents';
import SlideImage from './SlideImage';

export default function About({ aboutMe }) {
  // Extract YouTube embed URL
  const getYoutubeEmbedUrl = (markdown) => {
    if (!markdown) return '';
    const match = markdown.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
                  markdown.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : '';
  };
  const embedUrl = getYoutubeEmbedUrl(aboutMe.about);

  return (
    <section id="about" className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">

        {/* Left – crossfading image */}
        <div className="hidden lg:flex items-center justify-center py-16 pr-8">
          <SlideImage
            className="w-full aspect-[4/5] max-h-[80vh] shadow-2xl shadow-slate-900/10"
          />
        </div>

        {/* Right – bio + video */}
        <div className="py-20 lg:pl-16 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            About Me
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed">
            <Markdown options={{ overrides: { ...markdownOverrides, h1: { component: () => null }, h2: { component: () => null } } }}>
              {aboutMe.about || ''}
            </Markdown>
          </div>

          {/* YouTube embed */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800 night:border-purple-900/20 bg-slate-900">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="Yohanes Debebe Introduction Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                <BookOpen className="w-10 h-10 text-indigo-500/40" />
                <span className="text-sm">Introduction video placeholder</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400">Check out my video presentation to learn more about my coding philosophy.</p>
        </div>
      </div>
    </section>
  );
}