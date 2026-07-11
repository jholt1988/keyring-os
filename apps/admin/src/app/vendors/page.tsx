import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import VendorsView from './vendors-view';

/**
 * Server Component: prefetch the vendors list. VendorsView (client) reads the
 * same ['vendors'] query from the hydrated cache.
 * Part of the RSC migration (#22, admin follow-up).
 */
export default async function VendorsPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['vendors'], () => serverApiGet('/vendors'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VendorsView />
    </HydrationBoundary>
  );
}
