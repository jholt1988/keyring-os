import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import LeaseView from './lease-view';

/**
 * Server Component: prefetch the tenant's lease (the query behind the page's
 * initial skeleton). The renewal-offer and e-sign panels depend on the lease
 * id and stay client-fetched once the lease is known. LeaseView reads the same
 * ['my-lease'] query from the hydrated cache. Part of the RSC migration (#22).
 */
export default async function LeasePage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['my-lease'], () => serverApiGet('/leases/my-lease'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeaseView />
    </HydrationBoundary>
  );
}
