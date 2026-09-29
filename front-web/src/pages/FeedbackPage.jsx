import { MessageSquareHeart } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import SiteFeedbackSection from '../components/SiteFeedbackSection.jsx';
import { PageHeader, SectionShell } from '../components/ui.jsx';

export default function FeedbackPage() {
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
        <SiteFeedbackSection showHeading={false} />
      </SectionShell>
    </PublicLayout>
  );
}
