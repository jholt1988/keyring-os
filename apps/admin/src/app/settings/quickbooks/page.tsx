import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import QuickBooksSettingsView from './quickbooks-view';

/**
 * Server Component: prefetch the QuickBooks connection + accounting-sync status
 * (both back the `/quickbooks/status` resource). QuickBooksSettingsView reads
 * the same query keys from the hydrated cache.
 * Part of the RSC migration (#22, admin follow-up).
 */
export default async function QuickBooksSettingsPage() {
  const queryClient = createServerQueryClient();

  await Promise.all([
    prefetchServerQuery(queryClient, ['quickbooks-status'], () => serverApiGet('/quickbooks/status')),
    prefetchServerQuery(queryClient, ['accounting-sync-status'], () =>
      serverApiGet('/quickbooks/status'),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuickBooksSettingsView />
    </HydrationBoundary>
  );
}
