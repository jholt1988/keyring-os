import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import MessagesView from './messages-view';

/**
 * Server Component: prefetch the three independent messaging queries in parallel
 * (conversations, stats, tenants). The per-conversation messages query depends
 * on a client-selected conversation and stays client-fetched. MessagesView reads
 * the same query keys from the hydrated cache.
 * Part of the RSC migration (#22, admin follow-up).
 */
export default async function MessagesPage() {
  const queryClient = createServerQueryClient();

  await Promise.all([
    prefetchServerQuery(queryClient, ['messaging', 'conversations'], () =>
      serverApiGet('/messaging/admin/conversations'),
    ),
    prefetchServerQuery(queryClient, ['messaging', 'stats'], () => serverApiGet('/messaging/stats')),
    prefetchServerQuery(queryClient, ['messaging', 'tenants'], () =>
      serverApiGet('/messaging/tenants'),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MessagesView />
    </HydrationBoundary>
  );
}
