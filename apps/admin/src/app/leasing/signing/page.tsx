'use client';

import { useOperatorData, LeaseSigningView } from '@/features/operator';

export default function LeaseSigningPage() {
  const { data, loaded, token, refresh } = useOperatorData();
  return <LeaseSigningView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;
}
