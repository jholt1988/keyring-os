'use client';
import { useOperatorData } from '@/features/operator';
import { PredictiveMaintenanceView } from '@/features/operator';
import { ApprovalGate } from '@/features/operator';



export default function PredictiveMaintenancePage() {
  const { data, loaded, token, refresh } = useOperatorData();

  return (
    <ApprovalGate requiredRoles={['ADMIN', 'PROPERTY_MANAGER']}>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold">Predictive Maintenance</h1>
        {!loaded || !data ? (
          <div className="text-sm text-[var(--muted)]">Loading predictive data...</div>
        ) : (
          <PredictiveMaintenanceView
            data={data}
            token={token}
            onRefresh={refresh}
          />
        )}
      </div>
    </ApprovalGate>
  );
}
