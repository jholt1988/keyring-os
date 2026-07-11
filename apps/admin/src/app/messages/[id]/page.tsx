import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import ConversationView from './conversation-view';

/**
 * Server Component: prefetch the messages for this conversation. The client view
 * reads the same ['messages', id] query from the hydrated cache.
 * Part of the RSC migration (#22, admin follow-up).
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['messages', id], () =>
    serverApiGet(`/messaging/conversations/${id}/messages`),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConversationView />
    </HydrationBoundary>
  );
}
