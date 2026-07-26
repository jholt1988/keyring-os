import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import InspectionsView from './inspections-view';

/**
 * Server Component: prefetch the inspections list. Mirrors `fetchInspections`,
 * which unwraps the array from a possible envelope, so the hydrated shape
 * matches the client query exactly. Part of the RSC migration (#22).
 */
export default async function InspectionsPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['inspections'], async () => {
    const data = await serverApiGet<
      unknown[] | { data?: unknown[]; items?: unknown[]; inspections?: unknown[] }
    >('/inspections');
    return Array.isArray(data) ? data : data.data ?? data.items ?? data.inspections ?? [];
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InspectionsView />
    </HydrationBoundary>
  );
}
