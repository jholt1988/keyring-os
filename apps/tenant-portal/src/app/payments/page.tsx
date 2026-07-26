import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import PaymentsView from './payments-view';

/**
 * Server Component: prefetch the five independent payments queries in parallel
 * so the first paint carries data. PaymentsView (client) reads the same query
 * keys from the hydrated cache and keeps owning checkout / autopay mutations.
 * Part of the RSC migration (#22).
 */
export default async function PaymentsPage() {
  const queryClient = createServerQueryClient();

  await Promise.all([
    prefetchServerQuery(queryClient, ['my-lease'], () => serverApiGet('/leases/my-lease')),
    prefetchServerQuery(queryClient, ['invoices'], () => serverApiGet('/payments/invoices')),
    prefetchServerQuery(queryClient, ['payments'], () => serverApiGet('/payments')),
    prefetchServerQuery(queryClient, ['autopay'], () => serverApiGet('/billing/autopay')),
    prefetchServerQuery(queryClient, ['payment-methods'], () =>
      serverApiGet('/payments/payment-methods'),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentsView />
    </HydrationBoundary>
  );
}
