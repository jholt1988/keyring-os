import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import RentalApplicationStatusView from './application-status-view';

/**
 * Server Component: prefetch the rental application by id. The client view reads
 * the same ['rental-application', id] query from the hydrated cache.
 * Part of the RSC migration (#22).
 */
export default async function RentalApplicationStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = createServerQueryClient();

  if (id) {
    await prefetchServerQuery(queryClient, ['rental-application', id], () =>
      serverApiGet(`/rental-applications/${id}`),
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RentalApplicationStatusView />
    </HydrationBoundary>
  );
}
