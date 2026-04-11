'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FeedItem, FeedItemType, FeedAction,FeedActionType, MutationAction } from '@keyring/types';
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@keyring/ui/components/';
import { useExecuteFeedAction } from '@/app/hooks/useExecuteAction';

type FeedCardProps = {
  item: FeedItem;
  score?: number;
};

const kindLabel: Record<FeedItemType, string> = {
  critical_signal: 'Critical',
  decision: 'Decision',
  scheduled_event: 'Scheduled',
};

// Maps feed item kind to shadcn Badge variant
const kindVariant: Record<
  FeedItemType,
  'destructive' | 'default' | 'secondary'
> = {
  critical_signal: 'destructive',
  decision: 'default',
  scheduled_event: 'secondary',
};

// Maps FeedAction.variant to shadcn Button variant
const actionVariant = (
  v?: string,
): 'default' | 'outline' | 'destructive' | 'secondary' => {
  if (v === 'destructive') return 'destructive';
  if (v === 'secondary') return 'outline';
  return 'default';
};

export function FeedCard({ item, score }: FeedCardProps) {
  const router = useRouter();
  const {mutate, isPending} = useExecuteFeedAction();
  
  //Local state to manage the confirmation model
  const [pendingAction, setPendingAction] = useState<FeedAction | null>(null);

  //The Interceptor for destructive actions 
  const handleActionClick = (action: FeedAction) => {
    if(action.type  === 'navigation' ){
      // 1. Handle Navigation Immediately 
      if(action.openInNewTab){
        window.open(action.href, '_blank')
      } else {
        router.push(action.href)
      }
      return; // Stop here, don't show modal for navigation
    }
  //if the action is destructive, halt and show modal
  if(action.type === 'mutation') {
    if(action.requiresConfirm || action.variant === 'destructive'){
      setPendingAction(action);
    }else{
      //otherwise, execute the optimistic mutation immediately
      mutate({ intent: action.intent, itemId: item.id });
    }
  }
};

  const confirmAction = () =>{
    if(pendingAction){
      mutate({ intent: pendingAction.intent, itemId: item.id });
      setPendingAction(null);
    }
  }

  return (
    <>
    <article className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header row: kind badge + score */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant={kindVariant[item.kind]}>
          {kindLabel[item.kind]}
        </Badge>
        {score !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums">
            Priority {score?.toFixed(0)}
          </span>
        )}
      </div>

      {/* Title + summary */}
      <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>

      {/* Actions */}
      {item.actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.actions.map((action: FeedAction, idx: number) => (
            <Button
              key={idx}
              variant={actionVariant(action.variant)}
              size="sm"
              disabled={isPending}
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </article>
  

    /* Confirmation Modal */
    {pendingAction && (
    <Dialog open={!!pendingAction} onOpenChange={(open:boolean) => !open && setPendingAction(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Destructive Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to "{pendingAction?.label}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirmAction} disabled={isPending}>
            {isPending ? 'Processing...' : 'Confirm Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
)}
</>
  );
}
