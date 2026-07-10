import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import MaintenanceView from './maintenance-view';

/**
 * Server Component: prefetch the maintenance-request list so the first paint
 * carries data. MaintenanceView (client) reads the same ['maintenance'] query
 * from the hydrated cache. Part of the RSC migration (#22).
 */
export default async function MaintenancePage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['maintenance'], () => serverApiGet('/maintenance'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MaintenanceView />
    </HydrationBoundary>
  );
}
