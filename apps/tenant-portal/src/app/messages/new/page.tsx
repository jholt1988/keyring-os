import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import NewMessageView from './new-message-view';

/**
 * Server Component: prefetch the property-manager recipient list. The client
 * view reads the same ['property-managers'] query from the hydrated cache.
 * Part of the RSC migration (#22).
 */
export default async function NewMessagePage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['property-managers'], () =>
    serverApiGet('/messaging/property-managers'),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewMessageView />
    </HydrationBoundary>
  );
}
