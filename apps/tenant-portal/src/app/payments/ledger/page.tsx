import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import LedgerView from './ledger-view';

/**
 * Server Component: prefetch the lease, then the ledger keyed by lease id (the
 * client query is `enabled: !!lease?.id`, so it stays gated the same way). The
 * ledger fetch mirrors `fetchLedger`, unwrapping `{ entries }` so the hydrated
 * shape matches the client query exactly. Part of the RSC migration (#22).
 */
export default async function LedgerPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['my-lease'], () => serverApiGet('/leases/my-lease'));

  const lease = queryClient.getQueryData<{ id?: string }>(['my-lease']);
  if (lease?.id) {
    const leaseId = lease.id;
    await prefetchServerQuery(queryClient, ['ledger', leaseId], async () => {
      const data = await serverApiGet<{ entries?: unknown[] } | unknown[]>(
        `/payments/ledger/accounts/${leaseId}`,
      );
      return Array.isArray(data) ? data : data.entries ?? [];
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LedgerView />
    </HydrationBoundary>
  );
}
