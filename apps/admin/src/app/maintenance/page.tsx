'use client';

import { useOperatorData, MaintenanceDispatchView } from '@/features/operator';

export default function MaintenancePage() {
  const { data, loaded, token, refresh } = useOperatorData();
  return <MaintenanceDispatchView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;
}