import { Home, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import About from '../components/About.jsx';
import Timeline from '../components/Timeline.jsx';
import PublicLayout from '../components/PublicLayout.jsx';
import useAbout from '../hooks/useAbout.js';
import { Container, Notice, PageHeader } from '../components/ui.jsx';

export default function AboutPage() {
  const { aboutMe, error } = useAbout();

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="About"
        icon={User}
        title="The person behind"
        highlight="the work."
        description="Background, experience, education, and the thinking that runs underneath the projects — the long version of the introduction on the home page."
      />

      <Container size="wide" className="pt-10">
        {error && (
          <Notice tone="error" className="mb-10" title="Profile unavailable">
            The profile could not be loaded from the database.
          </Notice>
        )}
      </Container>

      {/* The home page carries a summary of this; here the heading lives in the
          page header and the section runs without its own. */}
      <div className="pt-10 sm:pt-14">
        <About aboutMe={aboutMe} showHeading={false} showSummary={false} size="wide" />
        <Timeline aboutMe={aboutMe} />
      </div>

      <Container size="narrow" className="pb-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/#about"
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
