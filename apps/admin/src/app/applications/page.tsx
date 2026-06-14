'use client';

import { useOperatorData, ApplicationsView } from '@/features/operator';

export default function ApplicationsPage() {
  const { data, loaded, token, refresh } = useOperatorData();
  return <ApplicationsView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;
}
