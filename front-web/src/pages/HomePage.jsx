import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import Contact from '../components/Contact.jsx';
import PublicLayout from '../components/PublicLayout.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { aboutApi } from '../api/about.js';
import { mapAboutLike } from '../services/adapters.js';
import { aboutMe as staticAbout } from '../data/portfolioData.js';

export default function HomePage() {
  const { data } = useAsyncResource(() => aboutApi.get().then((r) => r.about), []);

  const aboutMe = data ? mapAboutLike(data) : staticAbout;

  return (
    <PublicLayout>
      <Hero />
      <About aboutMe={aboutMe} />
      <Skills aboutMe={aboutMe} />
      <ProjectsSection />
      <Contact aboutMe={aboutMe} />
    </PublicLayout>
  );
}