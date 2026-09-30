import { Link } from 'react-router-dom';
import { FolderGit2, FolderKanban, Sparkles } from 'lucide-react';
import ProjectCard from './ProjectCard.jsx';
import AnimatedSection from './AnimatedSection';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { projectsApi } from '../api/projects.js';
import { projectToCard } from '../services/adapters.js';
import { ButtonLink, EmptyState, Notice, SectionHeading, SectionLinkCard, SectionShell, Skeleton } from './ui.jsx';

const PREVIEW_LIMIT = 6;

export default function ProjectsSection({ images = [], showHeading = true, showSummary = true }) {
  const { data, loading, error } = useAsyncResource(
    // The response carries `meta.total` as well, so one request gives both the
    // preview grid and the real count.
    () => projectsApi.list({ limit: PREVIEW_LIMIT }).then((r) => ({ items: r.items, total: r.meta?.total ?? 0 })),
    [],
  );
  const projects = (data?.items || []).map(projectToCard);
  const total = data?.total ?? projects.length;
  const types = [...new Set(projects.map((project) => project.type).filter(Boolean))];
  const linked = projects.filter((project) => project.repository || project.website).length;

  return (
    <SectionShell id="projects" size="wide" tone={images.length ? 'plain' : 'muted'}>
      {showHeading && (
        <AnimatedSection>
          <SectionHeading
            eyebrow="Portfolio"
            icon={FolderGit2}
            title="Selected work"
            description="Experiments, platforms, and tools shaped by curiosity and a bias toward useful software."
          >
            <ButtonLink to="/projects" variant="secondary" size="sm" className="mt-6">
              Browse all projects
            </ButtonLink>
          </SectionHeading>
        </AnimatedSection>
      )}

      <div className="mt-12">
        {error && (
          <Notice tone="error" className="mb-8" title="Projects unavailable">
            The project list could not be loaded from the database. Please try again shortly.
          </Notice>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading projects">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-96" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <AnimatedSection stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id || project.slug} project={project} />
            ))}
          </AnimatedSection>
        ) : !error ? (
          <EmptyState
            icon={Sparkles}
            title="No projects published yet"
            description="Projects added from the admin dashboard will appear here automatically."
            action={
              <ButtonLink to="/projects" variant="secondary" size="sm">
                Open the projects page
              </ButtonLink>
            }
          />
        ) : null}
      </div>

      {showSummary && projects.length > 0 && (
        <AnimatedSection delay={120}>
          <SectionLinkCard
            icon={FolderKanban}
            eyebrow="At a glance"
            title="The full portfolio"
            description="Every project with its stack, screenshots, problem statement, and a place to request something similar."
            to="/projects"
            linkLabel="Open the projects page"
            facts={[
              { label: 'Projects', value: total },
              { label: 'Types', value: types.length },
              { label: 'With links', value: linked },
            ]}
          >
            <ul className="mt-5 flex flex-wrap gap-2">
              {types.map((type) => (
                <li
                  key={type}
                  className="rounded-full border border-slate-200/70 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 dark:border-slate-700/70 dark:text-slate-300"
                >
                  {type}
                </li>
              ))}
            </ul>
          </SectionLinkCard>
        </AnimatedSection>
      )}

      {showSummary && projects.length > 0 && (
        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Want something built like this?{' '}
          <Link
            to="/projects#request-a-project"
            className="link-underline font-bold text-indigo-600 hover:text-indigo-500 dark:text-violet-300"
          >
            Send a project request
          </Link>
          .
        </p>
      )}
    </SectionShell>
  );
}
