import { Briefcase, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Timeline from '../components/Timeline.jsx';
import PublicLayout from '../components/PublicLayout.jsx';
import useAbout from '../hooks/useAbout.js';
import { Chip, Container, Notice, PageHeader } from '../components/ui.jsx';

export default function ExperiencePage() {
  const { aboutMe, error } = useAbout();
  const experiences = aboutMe?.experiences || [];
  const educations = aboutMe?.educations || [];
  const highlights = experiences.reduce((sum, experience) => sum + experience.highlights.length, 0);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Experience & education"
        icon={Briefcase}
        title="Where I have been"
        highlight="and learned."
        description="Roles, programmes, and the work that came out of them — the complete version of the trajectory summarised on the home page."
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <Chip tone="accent">{experiences.length} roles</Chip>
            <Chip tone="emerald">{educations.length} programmes</Chip>
            {highlights > 0 && <Chip>{highlights} highlights</Chip>}
          </div>
        }
      />

      <Container size="wide" className="pt-10">
        {error && (
          <Notice tone="error" className="mb-10" title="Profile unavailable">
            The profile could not be loaded from the database.
          </Notice>
        )}
      </Container>

      <div className="pt-10 sm:pt-14">
        <Timeline aboutMe={aboutMe} showHeading={false} showSummary={false} />
      </div>

      <Container size="narrow" className="pb-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/#experience"
            className="link-underline inline-flex items-center gap-1.5 font-bold text-indigo-600 dark:text-violet-300"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Back to the home page summary
          </Link>
        </p>
      </Container>
    </PublicLayout>
  );
}
