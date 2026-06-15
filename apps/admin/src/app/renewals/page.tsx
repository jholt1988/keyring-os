'use client';

import { useOperatorData, RenewalsView } from '@/features/operator';

export default function RenewalsPage() {
  const { data, loaded, token, refresh } = useOperatorData();
  return <RenewalsView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;
}
