'use client';

import { useOperatorData, OwnerStatementsView } from '@/features/operator';

export default function FinancialsPage() {
  const { data, loaded, token, refresh } = useOperatorData();
  return <OwnerStatementsView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;
}
