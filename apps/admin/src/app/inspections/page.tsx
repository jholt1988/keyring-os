'use client';

import { useOperatorData, InspectionEstimatesView } from '@/features/operator';

export default function InspectionsPage() {
  const { data, loaded, token, refresh } = useOperatorData();
  return <InspectionEstimatesView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;
}
