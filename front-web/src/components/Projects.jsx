import { useState } from 'react';
import { projects } from '../data/portfolioData';
import { X, ExternalLink, Github, ChevronLeft, ChevronRight, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from './markdownComponents';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openProject = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeProject = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (!selectedProject || !selectedProject.images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedProject.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (!selectedProject || !selectedProject.images.length) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedProject.images.length - 1 : prev - 1
    );
  };

  return (
    <>
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            return (
              <div
                key={project.id}
                onClick={() => openProject(project)}
                className="group flex flex-col h-full bg-white dark:bg-slate-800/40 night:bg-black/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 night:border-purple-900/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative"
              >
                {/* Visual card header */}
                <div className="h-48 w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/20 dark:to-purple-950/20 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
                  {project.images.length > 0 ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-indigo-500/40 dark:text-indigo-400/30">
                      <Code className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs font-mono tracking-wider uppercase">{project.folderName}</span>
                    </div>
                  )}
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-slate-950/5 dark:bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors duration-300" />
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                      {project.summary}
                    </p>
                  </div>

                  <div className="mt-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800/80 night:bg-purple-950/20 text-slate-600 dark:text-slate-300 night:text-purple-400 border border-slate-200/50 dark:border-slate-700/50 night:border-purple-900/10"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-medium text-slate-400">
                          +{project.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Quick Links */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 night:text-purple-400" onClick={e => e.stopPropagation()}>
                      {project.repository && (
                        <a
                          href={project.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-violet-400"
                        >
                          <Github className="w-3.5 h-3.5" /> Repository
                        </a>
                      )}
                      {project.website && (
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-violet-400"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal detail dialog */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <div
              onClick={closeProject}
              className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Content Container */}
            <div className="relative bg-white dark:bg-slate-900 night:bg-black rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 night:border-purple-900/30 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 night:bg-black/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 night:border-purple-900/20 flex items-center justify-between z-20">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
                  {selectedProject.title}
                </h3>
                <button
                  onClick={closeProject}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 outline-none cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-8 flex-grow">
                {/* Screenshot Carousel */}
                {selectedProject.images.length > 0 && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center aspect-video max-h-[380px] group border border-slate-200/50 dark:border-slate-800">
                    <img
                      src={selectedProject.images[currentImageIndex]}
                      alt={`${selectedProject.title} screenshot ${currentImageIndex + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />

                    {selectedProject.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 p-2 rounded-xl bg-slate-950/70 text-white hover:bg-slate-950 border border-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 p-2 rounded-xl bg-slate-950/70 text-white hover:bg-slate-950 border border-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Dot indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800/50">
                          {selectedProject.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                idx === currentImageIndex ? 'bg-indigo-500 scale-110' : 'bg-slate-500 hover:bg-slate-400'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Info and Tech */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  <div className="md:col-span-3 space-y-4">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Project Description</h4>
                    {/* Markdown rendering of full README */}
                    <div className="max-w-none text-sm leading-relaxed">
                      <ReactMarkdown components={markdownComponents}>{selectedProject.readme || selectedProject.summary}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Sidebar Metadata */}
                  <div className="space-y-6 md:border-l md:border-slate-100 dark:md:border-slate-800/80 md:pl-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tech Stack</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Actions</h4>
                      <div className="flex flex-col gap-2">
                        {selectedProject.repository && (
                          <a
                            href={selectedProject.repository}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-semibold transition-all border border-slate-800/80"
                          >
                            <Github className="w-4 h-4" /> Github Repo
                          </a>
                        )}
                        {selectedProject.website && (
                          <a
                            href={selectedProject.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/10"
                          >
                            <ExternalLink className="w-4 h-4" /> Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
