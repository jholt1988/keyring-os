import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import CapexView from './capex-view';

/**
 * Server Component: prefetch the CapEx summary + forecasts in parallel. The
 * forecasts fetch mirrors the client's `Array.isArray` guard so the hydrated
 * shape matches exactly. CapexView reads the same query keys from the hydrated
 * cache. Part of the RSC migration (#22, admin follow-up).
 */
export default async function CapexPage() {
  const queryClient = createServerQueryClient();

  await Promise.all([
    prefetchServerQuery(queryClient, ['capex-summary'], () =>
      serverApiGet('/capex-forecasting/summary'),
    ),
    prefetchServerQuery(queryClient, ['capex-forecasts'], async () => {
      const result = await serverApiGet<unknown>('/capex-forecasting/forecasts');
      return Array.isArray(result) ? result : [];
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CapexView />
    </HydrationBoundary>
  );
}
