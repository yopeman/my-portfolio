import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import Timeline from '../components/Timeline.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import Contact from '../components/Contact.jsx';
import PublicLayout from '../components/PublicLayout.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { aboutApi } from '../api/about.js';
import { mapAboutLike } from '../services/adapters.js';

const EMPTY_ABOUT = {
  headline: '',
  about: '',
  contact: '',
  skills: '',
  educations: [],
  experiences: [],
  images: [],
};

export default function HomePage() {
  const { data, loading, error } = useAsyncResource(
    () => aboutApi.get().then((r) => r.about),
    []
  );
  const aboutMe = data ? mapAboutLike(data) : EMPTY_ABOUT;

  return (
    <PublicLayout>
      {loading && (
        <div className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-violet-500 animate-pulse" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Loading profile…
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="border-b border-rose-100 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-4 py-3">
          <p role="alert" className="text-center text-sm text-rose-700 dark:text-rose-300 font-medium">
            Unable to load the portfolio from the database.
          </p>
        </div>
      )}

      {/* Hero */}
      <Hero aboutMe={aboutMe} />

      {/* Section Divider */}
      <div className="section-divider h-12" />

      {/* About */}
      <About aboutMe={aboutMe} />

      {/* Section Divider */}
      <div className="section-divider h-12" />

      {/* Skills */}
      <Skills aboutMe={aboutMe} />

      {/* Section Divider */}
      <div className="section-divider h-12" />

      {/* Experience & Education */}
      <Timeline aboutMe={aboutMe} />

      {/* Section Divider */}
      <div className="section-divider h-12" />

      {/* Projects */}
      <ProjectsSection images={aboutMe.images} />

      {/* Section Divider */}
      <div className="section-divider h-12" />

      {/* Contact */}
      <Contact aboutMe={aboutMe} />
    </PublicLayout>
  );
}