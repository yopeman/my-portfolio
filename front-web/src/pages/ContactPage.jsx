import { Home, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import Contact from '../components/Contact.jsx';
import PublicLayout from '../components/PublicLayout.jsx';
import useAbout from '../hooks/useAbout.js';
import { Container, Notice, PageHeader } from '../components/ui.jsx';

export default function ContactPage() {
  const { aboutMe, error } = useAbout();

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Contact"
        icon={MessageSquare}
        title="Get in"
        highlight="touch."
        description="Every channel, the message form, and the newsletter in one place. Pick whichever suits you — they all reach the same inbox."
      />

      <Container size="wide" className="pt-10">
        {error && (
          <Notice tone="error" className="mb-10" title="Contact details unavailable">
            The profile could not be loaded from the database.
          </Notice>
        )}
      </Container>

      <div className="pt-10 sm:pt-14">
        <Contact aboutMe={aboutMe} showHeading={false} showSummary={false} size="wide" />
      </div>

      <Container size="narrow" className="pb-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/#contact"
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
