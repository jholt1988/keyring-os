
// app/hooks/useCoPilotFeed.ts
import { useQuery } from '@tanstack/react-query';
import { mockFeed } from '@keyring/types';
import type { FeedResponse } from '@keyring/types';
import { useExecuteFeedAction } from './useExecuteAction';
import { API_V2_BASE } from '@/lib/api-client';

const API_BASE = API_V2_BASE;

export function useCoPilotFeed() {
  const performAction = useExecuteFeedAction();
  const { data, isLoading } = useQuery<FeedResponse>({
    queryKey: ['copilot-feed'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/feed`, { credentials: 'include' });
      if (!res.ok) {

        console.error('Failed to fetch feed');
        return {
          items: mockFeed,
          role: 'ADMIN',
          generatedAt: new Date().toISOString(),
        } satisfies FeedResponse;
      }
      // The backend may wrap the payload in one or both envelopes
      // ({ data: { result: {...} } }); peel recognised layers to the FeedResponse.
      let body: unknown = await res.json();
      for (let i = 0; i < 5 && body && typeof body === 'object'; i++) {
        if ('data' in body && 'meta' in body && 'errors' in body) { body = (body as { data: unknown }).data; continue; }
        if ('result' in body && 'confidence' in body) { body = (body as { result: unknown }).result; continue; }
        break;
      }
      return body as FeedResponse;
    },
    refetchInterval: 30000, // Poll every 30 seconds to keep feed fresh
  });

  return {
    items: data?.items ?? [],
    userRole: data?.role,
    isLoading,
    performAction,
  };
}
