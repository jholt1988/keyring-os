import type { FeedItem, UserRole } from '@keyring/types';
import { FeedCard } from './feed-card';

type FeedListProps = {
  items: FeedItem[];
  role: UserRole;
};

export function FeedList({ items, role: _role }: FeedListProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No items require your attention right now.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        // priority is pre-computed by the backend — pass it directly
        <FeedCard key={item.id} item={item} score={item.priority} />
      ))}
    </div>
  );
}
