// app/hooks/useExecuteAction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeFeedDomainAction } from '../actions/feed-domain-actions';
import type { FeedItem, MutationAction } from '@keyring/types';

export function useExecuteFeedAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ item, action }: { item: FeedItem; action: MutationAction }) =>
      executeFeedDomainAction(action, item),
    
    // 1. Intercept before the network request
    onMutate: async ({ item }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['copilot-feed'] });

      // Snapshot the previous value
      const previousFeed = queryClient.getQueryData(['copilot-feed']);

      // Optimistically update to the new value (remove the clicked item)
      if (previousFeed) {
        queryClient.setQueryData(
          ['copilot-feed'], 
          (old: any) => {
            if (!old || !Array.isArray(old.items)) return old;
            return {
              ...old,
              items: old.items.filter((candidate: FeedItem) => candidate.id !== item.id),
            };
          },
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
