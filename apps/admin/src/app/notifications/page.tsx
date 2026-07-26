import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import NotificationsView from './notifications-view';

/**
 * Server Component: prefetch the notifications list. NotificationsView (client)
 * reads the same ['notifications'] query from the hydrated cache.
 * Part of the RSC migration (#22, admin follow-up).
 */
export default async function NotificationsPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['notifications'], () => serverApiGet('/notifications'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsView />
    </HydrationBoundary>
  );
}
