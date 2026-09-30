import { useMemo } from 'react';
import { Download, FileText, Images, Maximize2 } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { filesApi } from '../api/files.js';
import { resolveFileUrl } from '../services/adapters.js';
import { EmptyState, Notice, PageHeader, SectionShell, Skeleton } from '../components/ui.jsx';

const ENTITY_LABELS = {
  about: 'Profile',
  project: 'Project',
  blog: 'Post',
  plan: 'Plan',
  user: 'Account',
};

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

function fileLabel(file) {
  return file.title || file.name || 'Untitled';
}

export default function GalleryPage() {
  const { data, loading, error } = useAsyncResource(
    () => filesApi.gallery({ limit: 200 }).then((r) => r.items),
    [],
  );

  const files = useMemo(() => data || [], [data]);
  const images = useMemo(() => files.filter((file) => file.isImage), [files]);
  const documents = useMemo(() => files.filter((file) => !file.isImage), [files]);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Gallery"
        icon={Images}
        title="Every image and"
        highlight="file in one place."
        description="Screenshots, diagrams, and supporting documents uploaded across the profile, projects, posts, and plans."
        meta={
          !loading && files.length > 0 ? (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white">{files.length}</span> files —{' '}
              {images.length} images, {documents.length} documents
            </p>
          ) : null
        }
      />

      <SectionShell size="wide" divider={false}>
        {error && (
          <Notice tone="error" className="mb-10" title="Gallery unavailable">
            The file library could not be loaded from the database.
          </Notice>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading gallery">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="aspect-square" />
            ))}
          </div>
        ) : files.length > 0 ? (
          <>
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              Images
            </h2>

            {images.length > 0 ? (
              <AnimatedSection
                stagger
                className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              >
                {images.map((image) => (
                  <a
                    key={image._id}
                    href={resolveFileUrl(image.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring group relative aspect-square overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-700/70 dark:bg-slate-800/60"
                  >
                    <img
                      src={resolveFileUrl(image.path)}
                      alt={image.alt || fileLabel(image)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-white">
                            {fileLabel(image)}
                          </span>
                          <span className="block text-[10px] text-white/70">
                            {ENTITY_LABELS[image.parentEntity] || image.parentEntity}
                          </span>
                        </span>
                        <Maximize2 className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                      </span>
                    </span>
                  </a>
                ))}
              </AnimatedSection>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No images uploaded yet.</p>
            )}

            <h2 className="mt-14 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              Documents &amp; other files
            </h2>

            {documents.length > 0 ? (
              <AnimatedSection stagger className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <a
                    key={doc._id}
                    href={resolveFileUrl(doc.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileLabel(doc)}
                    className="focus-ring group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:border-violet-500/50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-violet-300">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-violet-300">
                        {fileLabel(doc)}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {[
                          ENTITY_LABELS[doc.parentEntity] || doc.parentEntity,
                          doc.mimeType?.split('/')[1]?.toUpperCase(),
                          formatFileSize(doc.size),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <Download
                      className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </AnimatedSection>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                No documents uploaded yet.
              </p>
            )}
          </>
        ) : !error ? (
          <EmptyState
            icon={Images}
            title="Nothing in the gallery yet"
            description="Images and documents uploaded from the admin dashboard appear here."
          />
        ) : null}
      </SectionShell>
    </PublicLayout>
  );
}
