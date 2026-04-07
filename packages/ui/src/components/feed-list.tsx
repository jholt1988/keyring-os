'use client';

import type { FeedItem } from '@keyring/types';
import { FeedCard } from './feed-card';

type FeedListProps = {
  items: FeedItem[];
};

export function FeedList({ items }: FeedListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}