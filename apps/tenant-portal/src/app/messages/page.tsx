import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import MessagesView from './messages-view';

/**
 * Server Component: prefetch the conversation list. MessagesView (client) reads
 * the same ['conversations'] query from the hydrated cache. RSC migration (#22).
 */
export default async function MessagesPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['conversations'], () =>
    serverApiGet('/messaging/conversations'),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MessagesView />
    </HydrationBoundary>
  );
}
