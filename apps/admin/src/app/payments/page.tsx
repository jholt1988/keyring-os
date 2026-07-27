'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOperatorData, WorkflowsView } from '@/features/operator';
import type { OperatorWorkflowItem } from '@/lib/operator/read-only-data';

const ROUTE_BY_WORKFLOW_PREFIX: Record<string, string> = {
  'WF-APP': '/applications',
  'WF-LEASE': '/leasing',
  'WF-MNT': '/maintenance',
  'WF-INSP': '/inspections',
  'WF-RENEW': '/renewals',
  'WF-OWNER': '/financials',
};

export default function PaymentsPage() {
  const { data, loaded } = useOperatorData();
  const router = useRouter();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  const handleOpenWorkflow = useCallback((item: OperatorWorkflowItem) => {
    const prefix = Object.keys(ROUTE_BY_WORKFLOW_PREFIX).find((key) =>
      item.workflowId.startsWith(key),
    );
    if (prefix) {
      const route = ROUTE_BY_WORKFLOW_PREFIX[prefix];
      router.push(`${route}?workflow=${encodeURIComponent(item.id)}`);
    }
  }, [router]);

  return (
    <WorkflowsView
      data={data}
      loaded={loaded}
      selectedWorkflowId={selectedWorkflowId}
      onSelectWorkflow={(w) => setSelectedWorkflowId(w.id)}
      onOpenWorkflow={handleOpenWorkflow}
    />
  );
}
