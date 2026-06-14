'use client';

import { useState } from 'react';
import { useOperatorData, WorkflowsView } from '@/features/operator';

export default function PaymentsPage() {
  const { data, loaded } = useOperatorData();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  return <WorkflowsView data={data} loaded={loaded} selectedWorkflowId={selectedWorkflowId} onSelectWorkflow={(w) => setSelectedWorkflowId(w.id)} onOpenWorkflow={() => {}} />;
}
