import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import ESignaturesView from './esignatures-view';

/**
 * Server Component: prefetch the e-signature risk queue. ESignaturesView
 * (client) reads the same ['esign-envelopes'] query from the hydrated cache.
 * Part of the RSC migration (#22, admin follow-up).
 */
export default async function ESignaturesPage() {
  const queryClient = createServerQueryClient();
  await prefetchServerQuery(queryClient, ['esign-envelopes'], () =>
    serverApiGet('/esignature/risk-queue'),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ESignaturesView />
    </HydrationBoundary>
  );
}
