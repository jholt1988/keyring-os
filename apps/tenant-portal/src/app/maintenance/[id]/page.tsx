import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import MaintenanceDetailView from './maintenance-detail-view';

/**
 * Server Component: prefetch a single maintenance request by id. The client
 * view reads the same ['maintenance', id] query from the hydrated cache.
 * Part of the RSC migration (#22).
 */
export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['maintenance', id], () =>
    serverApiGet(`/maintenance/${id}`),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MaintenanceDetailView />
    </HydrationBoundary>
  );
}
