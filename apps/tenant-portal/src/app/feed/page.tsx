import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import FeedView from './feed-view';

/**
 * Server Component: prefetch the tenant feed so the first paint carries data,
 * eliminating the client mount -> fetch -> render waterfall. FeedView (client)
 * reads the same ['tenant-feed'] query from the hydrated cache and keeps owning
 * dismiss / refetch / filter interactivity. Part of the RSC migration (#22).
 */
export default async function FeedPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['tenant-feed'], () => serverApiGet('/tenant/feed'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeedView />
    </HydrationBoundary>
  );
}
