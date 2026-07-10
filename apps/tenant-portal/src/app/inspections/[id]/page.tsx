import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import InspectionDetailView from './inspection-detail-view';

/**
 * Server Component: prefetch a single inspection by id. The client view reads
 * the same ['inspection', id] query from the hydrated cache. RSC migration (#22).
 */
export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['inspection', id], () =>
    serverApiGet(`/inspections/${id}`),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InspectionDetailView />
    </HydrationBoundary>
  );
}
