import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import SmartDevicesView from './smart-devices-view';

/**
 * Server Component: prefetch the smart-devices list (the query behind the
 * initial render). The access-codes query depends on a client-selected device
 * and stays client-fetched. SmartDevicesView reads the same ['smart-devices']
 * query from the hydrated cache. Part of the RSC migration (#22, admin follow-up).
 */
export default async function SmartDevicesPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['smart-devices'], () => serverApiGet('/smart-devices'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SmartDevicesView />
    </HydrationBoundary>
  );
}
