import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import DocumentsView from './documents-view';

/**
 * Server Component: prefetch the documents list so the first paint carries data,
 * eliminating the client mount -> fetch -> render waterfall. DocumentsView
 * (client) reads the same ['documents'] query from the hydrated cache.
 * Part of the RSC migration (#22, admin follow-up).
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
