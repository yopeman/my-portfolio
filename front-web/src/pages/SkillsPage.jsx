import { Home, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skills from '../components/Skills.jsx';
import { summarizeSkills } from '../services/skillsSummary.js';
import PublicLayout from '../components/PublicLayout.jsx';
import useAbout from '../hooks/useAbout.js';
import { Card, Container, Notice, PageHeader, ProgressBar, SectionShell } from '../components/ui.jsx';

export default function SkillsPage() {
  const { aboutMe, error } = useAbout();
  const summary = summarizeSkills(aboutMe?.skills);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Skills"
        icon={Layers}
        title="The full"
        highlight="toolkit."
        description="Every category published in the admin dashboard, with the proficiency level recorded against each entry."
        meta={
          summary.total > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip">{summary.total} skills</span>
              <span className="chip">{summary.categories.length} categories</span>
              {summary.average !== null && <span className="chip">avg. {summary.average}%</span>}
            </div>
          ) : null
        }
      />

      <Container size="wide" className="pt-10">
        {error && (
          <Notice tone="error" className="mb-10" title="Skills unavailable">
            The profile could not be loaded from the database.
          </Notice>
        )}
      </Container>

      <div className="pt-10 sm:pt-14">
        <Skills aboutMe={aboutMe} showHeading={false} showSummary={false} />
      </div>

      {summary.categories.length > 0 && (
        <SectionShell size="wide" tone="muted">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Category breakdown
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            How many skills sit under each heading, and how the average lands.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {summary.categories.map((category) => (
              <Card key={category.name} interactive={false} className="p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{category.name}</h3>
                  <span className="text-xs font-bold text-slate-400">
                    {category.count} {category.count === 1 ? 'skill' : 'skills'}
                  </span>
                </div>
                {category.average !== null && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Average level</span>
                      <span className="counter-value">{category.average}%</span>
                    </div>
                    <ProgressBar value={category.average} label={`${category.name} average proficiency`} size="sm" />
                  </div>
                )}
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {category.entries.map((entry) => (
                    <li
                      key={entry.name}
                      className="rounded-full border border-slate-200/70 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700/70 dark:text-slate-300"
                    >
                      {entry.name}
                      {entry.level !== null && <span className="ml-1 text-slate-400">{entry.level}%</span>}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </SectionShell>
      )}

      <Container size="narrow" className="pb-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/#skills"
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
