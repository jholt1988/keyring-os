'use client';

import type { FeedItem } from '@keyring/types';

type FeedCardProps = {
  item: FeedItem;
};

export function FeedCard({ item }: FeedCardProps) {
  return (
    <article className="rounded-2xl border p-4 shadow-sm">
      <div className="mb-2 text-sm opacity-70">{item.type}</div>
      <h3 className="text-lg font-semibold">{item.title}</h3>
      <p className="mt-1 text-sm opacity-80">{item.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.actions.map((action) => (
          <button
            key={action.id}
            className="rounded-xl border px-3 py-2 text-sm"
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );
}