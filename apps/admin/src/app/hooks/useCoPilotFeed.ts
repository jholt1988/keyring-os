
// app/hooks/useCoPilotFeed.ts
import { useQuery,   useQueryClient, useMutation } from '@tanstack/react-query';
import {mockFeed } from '@keyring/types';
import type { FeedItem, FeedResponse } from '@keyring/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export function useCoPilotFeed() {
  const queryClient = useQueryClient();
  const {data,isLoading} = useQuery<FeedResponse>({
    queryKey: ['copilot-feed'],
    queryFn: async () => {
      // Assuming Next.js rewrites or a direct absolute URL to your NestJS backend
      const res = await fetch(`${BACKEND_URL}/api/feed`, {
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
      const res = await fetch(`/api/feed/actions`, {
        method: 'POST',
        body: JSON.stringify({ itemId, intent }),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  return { 
    items: data?.items ?? [], 
    userRole: data?.role,
    isLoading, 
    performAction,
    
  };
}