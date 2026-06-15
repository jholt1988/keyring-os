'use client';
import { useOperatorData } from '@/features/operator';
import { RentOptimizationView } from '@/features/operator';
import { ApprovalGate } from '@/features/operator';



export default function RentOptimizationPage({
  searchParams,
}: {
  searchParams: { unitId?: string };
}) {
  const { data, loaded, token, refresh } = useOperatorData();

  return (
    <ApprovalGate requiredRoles={['ADMIN', 'PROPERTY_MANAGER']}>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold">Rent Optimization</h1>
        {!loaded || !data ? (
          <div className="text-sm text-[var(--muted)]">Loading data...</div>
        ) : (
          <RentOptimizationView
            data={data}
            token={token}
            initialUnitId={searchParams.unitId}
          />
        )}
      </div>
    </ApprovalGate>
  );
}
