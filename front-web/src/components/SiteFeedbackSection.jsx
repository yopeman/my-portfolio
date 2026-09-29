import { MessageSquareHeart } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import ReactionBar from './ReactionBar.jsx';
import FeedbackSection from './FeedbackSection.jsx';
import { useAsyncResource } from '../hooks/useAsyncResource.js';
import { systemApi } from '../api/system.js';
import { Card, Notice, SectionHeading, Skeleton } from './ui.jsx';

/**
 * The whole-site feedback thread, keyed to the `system` parent entity.
 * Shared by the home page and the dedicated /feedback route so both render
 * the same thread.
 */
export default function SiteFeedbackSection({ showHeading = true, className = '' }) {
  const { data, error } = useAsyncResource(() => systemApi.get().then((r) => r.system), []);
  const systemId = data?._id || null;

  if (error) {
    return (
      <Notice tone="error" className={className} title="Feedback unavailable">
        The feedback thread could not be loaded. Please try again shortly.
      </Notice>
    );
  }

  if (!systemId) {
    return <Skeleton className={`h-64 ${className}`} />;
  }

  return (
    <div className={className}>
      {showHeading && (
        <AnimatedSection>
          <SectionHeading
            eyebrow="Site feedback"
            icon={MessageSquareHeart}
            title="Tell me what to"
            highlight="build next."
            description="One thread for the whole site. Ask for a feature, flag something broken, or leave a note on what is working. Sign in to react; comments post as guest otherwise."
          />
        </AnimatedSection>
      )}

      <div className={showHeading ? 'mt-10' : ''}>
        <Card interactive={false} className="p-6 sm:p-8">
          <ReactionBar parentEntity="system" parentId={systemId} />
        </Card>
        <FeedbackSection parentEntity="system" parentId={systemId} />
      </div>
    </div>
  );
}
