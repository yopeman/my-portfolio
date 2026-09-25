import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
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
        <p className="border-b border-slate-100 px-4 py-3 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Loading profile…
        </p>
      )}
      {error && (
        <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          Unable to load the portfolio from the database.
        </p>
      )}
      <Hero aboutMe={aboutMe} />
      <About aboutMe={aboutMe} />
      <Skills aboutMe={aboutMe} />
      <ProjectsSection images={aboutMe.images} />
      <Contact aboutMe={aboutMe} />
    </PublicLayout>
  );
}