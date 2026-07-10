import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Document } from '@/lib/tenant-api';
import { serverApiGet } from '@/lib/server-fetch';
import DocumentsView from './documents-view';

/**
 * Server Component: prefetch the documents list on the server so the first
 * paint already carries data, eliminating the client mount -> fetch -> render
 * waterfall. `DocumentsView` (client) reads the same ['documents'] query from
 * the hydrated cache and keeps owning search / category-filter interactivity.
 *
 * Reference implementation for the broader RSC migration (backlog #22).
 */
export default async function DocumentsPage() {
  const queryClient = new QueryClient();

  try {
    await queryClient.fetchQuery({
      queryKey: ['documents'],
      queryFn: () => serverApiGet<Document[]>('/documents'),
      retry: false,
    });
  } catch {
    // Backend unreachable during SSR: skip hydration and let the client fetch.
    // dehydrate() only serializes successful queries, so no error state leaks.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentsView />
    </HydrationBoundary>
  );
}
