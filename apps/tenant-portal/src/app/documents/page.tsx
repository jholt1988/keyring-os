import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import DocumentsView from './documents-view';

/**
 * Server Component: prefetch the documents list so the first paint carries data
 * (no client mount -> fetch -> render waterfall). DocumentsView (client) reads
 * the same ['documents'] query from the hydrated cache and owns search/filter.
 * Reference implementation for the RSC migration (#22).
 */
export default async function DocumentsPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['documents'], () => serverApiGet('/documents'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentsView />
    </HydrationBoundary>
  );
}
