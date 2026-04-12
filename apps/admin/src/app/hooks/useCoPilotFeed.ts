
// app/hooks/useCoPilotFeed.ts
import { useQuery,   useQueryClient, useMutation } from '@tanstack/react-query';
import {mockFeed } from '@keyring/types';
import type { FeedResponse } from '@keyring/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export function useCoPilotFeed() {
  const queryClient = useQueryClient();
  const {data,isLoading} = useQuery<FeedResponse>({
    queryKey: ['copilot-feed'],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_URL}/feed`, {
        headers: {
          'X-Mock-User-Id': 'dev-admin-uuid-001',
          'X-Mock-Role': 'admin',
        },
      });
      if (!res.ok) {

        console.error('Failed to fetch feed');
        return mockFeed;
      }
      return res.json();
    },
    refetchInterval: 30000, // Poll every 30 seconds to keep feed fresh
  });

  const performAction = useMutation({
    mutationFn: async ({ itemId, intent }: { itemId: string; intent: string }) => {
      const res = await fetch(`${BACKEND_URL}/api/v2/feed/${itemId}/action`, {
        method: 'POST',
        body: JSON.stringify({ intent }),
        headers: {
          'Content-Type': 'application/json',
          'X-Mock-User-Id': 'dev-admin-uuid-001',
          'X-Mock-Role': 'admin',
        },
      });
      if (!res.ok) {
        throw new Error(`Feed action failed with status ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['copilot-feed'] }),
  });

  return { 
    items: data?.items ?? [], 
    userRole: data?.role,
    isLoading, 
    performAction,
    
  };
}
