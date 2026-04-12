
// app/hooks/useCoPilotFeed.ts
import { useQuery } from '@tanstack/react-query';
import { mockFeed } from '@keyring/types';
import type { FeedResponse } from '@keyring/types';
import { useExecuteFeedAction } from './useExecuteAction';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export function useCoPilotFeed() {
  const performAction = useExecuteFeedAction();
  const { data, isLoading } = useQuery<FeedResponse>({
    queryKey: ['copilot-feed'],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_URL}/feed`, {
        headers: {
          'X-Mock-User-Id': 'dev-admin-uuid-001',
          'X-Mock-Role': 'ADMIN',
        },
      });
      if (!res.ok) {

        console.error('Failed to fetch feed');
        return {
          items: mockFeed,
          role: 'ADMIN',
          generatedAt: new Date().toISOString(),
        } satisfies FeedResponse;
      }
      return res.json();
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
