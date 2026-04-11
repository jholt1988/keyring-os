// app/hooks/useExecuteAction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeFeedAction } from '../actions/feed-actions';
import type { FeedItem } from '@keyring/types'; // Adjust import as needed

export function useExecuteFeedAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ intent, itemId }: { intent: string; itemId: string }) => 
      executeFeedAction(intent, itemId),
    
    // 1. Intercept before the network request
    onMutate: async ({ itemId }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['copilot-feed'] });

      // Snapshot the previous value
      const previousFeed = queryClient.getQueryData<FeedItem[]>(['copilot-feed']);

      // Optimistically update to the new value (remove the clicked item)
      if (previousFeed) {
        queryClient.setQueryData<FeedItem[]>(
          ['copilot-feed'], 
          old => old?.filter(item => item.id !== itemId) ?? []
        );
      }

      // Return a context object with the snapshotted value
      return { previousFeed };
    },
    
    // 2. If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['copilot-feed'], context.previousFeed);
      }
      // Optional: Add toast error notification here
      console.error('Action failed, rolling back UI state.', err);
    },
    
    // 3. Always refetch after error or success to guarantee sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['copilot-feed'] });
    },
  });
}