'use client';

import type { FeedItem, FeedItemType } from '@keyring/types';

type FeedCardProps = {
  item: FeedItem;
};

const kindLabel: Record<FeedItemType, string> = {
  critical_signal: 'Critical',
  decision: 'Decision',
  scheduled_event: 'Scheduled',
};

const kindStyle: Record<FeedItemType, string> = {
  critical_signal: 'bg-red-100 text-red-700',
  decision: 'bg-amber-100 text-amber-700',
  scheduled_event: 'bg-blue-100 text-blue-700',
};

const actionStyle: Record<string, string> = {
  default: 'bg-foreground text-background hover:opacity-90',
  secondary: 'border border-border bg-transparent hover:bg-muted',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
};

export function FeedCard({ item }: FeedCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${kindStyle[item.kind]}`}
        >
          {kindLabel[item.kind]}
        </span>
        <span className="text-xs text-muted-foreground">
          Score {item.priority}
        </span>
      </div>

      <h3 className="text-base font-semibold leading-snug">{item.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.actions.map((action) => (
          <button
            key={action.id}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${actionStyle[action.variant ?? 'default']}`}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );
}