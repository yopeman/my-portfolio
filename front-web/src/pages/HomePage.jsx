import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import Timeline from '../components/Timeline.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import WritingSection from '../components/WritingSection.jsx';
import RoadmapSection from '../components/RoadmapSection.jsx';
import Contact from '../components/Contact.jsx';
import SiteFeedbackSection from '../components/SiteFeedbackSection.jsx';
import PublicLayout from '../components/PublicLayout.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { aboutApi } from '../api/about.js';
import { mapAboutLike } from '../services/adapters.js';
import { SectionShell } from '../components/ui.jsx';

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
    [],
  );
  const aboutMe = data ? mapAboutLike(data) : EMPTY_ABOUT;

  return (
    <PublicLayout>
      {error && (
        <div role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          The profile could not be loaded from the database. Sections below may be empty.
        </div>
      )}

      <Hero aboutMe={aboutMe} />

      {/* Narrative: who this is, what it is built with, where it came from. */}
      <About aboutMe={aboutMe} />
      <Skills aboutMe={aboutMe} />
      <Timeline aboutMe={aboutMe} />

      {/* Proof: shipped work, writing, and the plan behind it. */}
      <ProjectsSection images={aboutMe.images} />
      <WritingSection />
      <RoadmapSection />

      {/* Conversion. */}
      <Contact aboutMe={aboutMe} />

      {/* Feedback: the last word on the page, next to the footer. */}
      <SectionShell id="site-feedback" size="wide" divider={false}>
        <SiteFeedbackSection />
      </SectionShell>

      {loading && <span className="sr-only" role="status">Loading profile…</span>}
    </PublicLayout>
  );
}
