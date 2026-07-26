import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import NotificationsView from './notifications-view';

/**
 * Server Component: prefetch the full notifications list. NotificationsView
 * (client) reads the same ['notifications', 'all'] query from the hydrated
 * cache and keeps owning mark-read mutations. Part of the RSC migration (#22).
 */
export default async function NotificationsPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['notifications', 'all'], () =>
    serverApiGet('/notifications'),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsView />
    </HydrationBoundary>
  );
}
