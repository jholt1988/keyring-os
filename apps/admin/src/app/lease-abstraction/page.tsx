import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import LeaseAbstractionView from './lease-abstraction-view';

/**
 * Server Component: prefetch the lease-abstraction analytics + list in parallel.
 * LeaseAbstractionView reads the same query keys from the hydrated cache.
 * Part of the RSC migration (#22, admin follow-up).
 */
export default async function LeaseAbstractionPage() {
  const queryClient = createServerQueryClient();

  await Promise.all([
    prefetchServerQuery(queryClient, ['lease-abstraction-analytics'], () =>
      serverApiGet('/lease-abstraction/analytics'),
    ),
    prefetchServerQuery(queryClient, ['lease-abstractions'], () =>
      serverApiGet('/lease-abstraction/abstractions'),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeaseAbstractionView />
    </HydrationBoundary>
  );
}
