'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FeedItem, FeedItemType, FeedAction, MutationAction } from '@keyring/types';
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui';
import { useExecuteFeedAction } from '@/app/hooks/useExecuteAction';

type FeedCardProps = {
  item: FeedItem;
  score?: number;
};

const kindLabel: Record<FeedItemType, string> = {
  critical_signal: 'Critical',
  decision: 'Decision',
  scheduled_event: 'Scheduled',
  update: 'Update',
};

const kindVariant: Record<
  FeedItemType,
  'destructive' | 'default' | 'secondary'
> = {
  critical_signal: 'destructive',
  decision: 'default',
  scheduled_event: 'secondary',
  update: 'secondary',
};

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
  const [pendingAction, setPendingAction] = useState<FeedAction | null>(null);

  const handleActionClick = (action: FeedAction) => {
    if(action.type  === 'navigation' ){
      if(action.openInNewTab){
        window.open(action.href, '_blank')
      } else {
        router.push(action.href)
      }
      return;
    }
  if(action.type === 'mutation') {
    if(action.requiresConfirm || action.variant === 'destructive'){
      setPendingAction(action);
    }else{
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
    <article className="rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)] transition-all duration-[180ms] hover:border-[#2B4A73]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant={kindVariant[item.kind]}>
          {kindLabel[item.kind]}
        </Badge>
        {score !== undefined && (
          <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
            Priority {score?.toFixed(0)}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold leading-snug text-[#F8FAFC]">{item.title}</h3>
      <p className="mt-1 text-sm text-[#94A3B8]">{item.summary}</p>

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

    {pendingAction && (
    <Dialog open={!!pendingAction} onOpenChange={(open:boolean) => !open && setPendingAction(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Destructive Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to &quot;{pendingAction?.label}&quot;? This action cannot be undone.
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
