import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import MoveOutView from './move-out-view';

/**
 * Server Component: prefetch the tenant's lease so the move-out form renders
 * with data on first paint. The client view reads the same ['my-lease'] query
 * from the hydrated cache. Part of the RSC migration (#22).
 */
export default async function MoveOutPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['my-lease'], () => serverApiGet('/leases/my-lease'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MoveOutView />
    </HydrationBoundary>
  );
}
