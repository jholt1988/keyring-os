import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import ConversationView from './conversation-view';

/**
 * Server Component: prefetch the conversation list and the messages for this
 * conversation in parallel. The client view reads the same ['conversations']
 * and ['messages', convId] queries from the hydrated cache. RSC migration (#22).
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const convId = Number(id);
  const queryClient = createServerQueryClient();

  await Promise.all([
    prefetchServerQuery(queryClient, ['conversations'], () =>
      serverApiGet('/messaging/conversations'),
    ),
    prefetchServerQuery(queryClient, ['messages', convId], () =>
      serverApiGet(`/messaging/conversations/${convId}/messages`),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConversationView />
    </HydrationBoundary>
  );
}
