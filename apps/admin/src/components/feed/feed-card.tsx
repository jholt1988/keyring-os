'use client';

import type { FeedItem, FeedItemType } from '@keyring/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header row: kind badge + score */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant={kindVariant[item.kind]}>
          {kindLabel[item.kind]}
        </Badge>
        {score !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums">
            Priority {score}
          </span>
        )}
      </div>

      {/* Title + summary */}
      <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>

      {/* Actions */}
      {item.actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.actions.map((action) => (
            <Button
              key={action.id}
              variant={actionVariant(action.variant)}
              size="sm"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </article>
  );
}
