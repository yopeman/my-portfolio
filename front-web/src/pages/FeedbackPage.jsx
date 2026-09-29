import { MessageSquareHeart } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { systemApi } from '../api/system.js';
import { Card, PageHeader, SectionShell, Skeleton } from '../components/ui.jsx';

export default function FeedbackPage() {
  const { data, error } = useAsyncResource(() => systemApi.get().then((r) => r.system), []);
  const systemId = data?._id || null;

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Site feedback"
        icon={MessageSquareHeart}
        title="Tell me what to"
        highlight="build next."
        description="One thread for the whole site. Ask for a feature, flag something broken, or leave a note on what is working. Sign in to react; comments post as guest otherwise."
      />

      <SectionShell size="narrow" divider={false}>
        {error ? (
          <Card interactive={false} className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Feedback is unavailable right now. Please try again shortly.
            </p>
          </Card>
        ) : systemId ? (
          <AnimatedSection>
            <Card interactive={false} className="p-6 sm:p-8">
              <ReactionBar parentEntity="system" parentId={systemId} />
            </Card>
            <FeedbackSection parentEntity="system" parentId={systemId} />
          </AnimatedSection>
        ) : (
          <Skeleton className="h-96" />
        )}
      </SectionShell>
    </PublicLayout>
  );
}
