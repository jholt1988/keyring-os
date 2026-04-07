import { mockFeed } from '@keyring/types/mock-feed';
import { getFeedForRole } from '@keyring/types/feed-filter';
import type { UserRole } from '@keyring/types/feed';
import { FeedList } from '@keyring/ui';

const role: UserRole = 'property_manager';
// Later: derive from auth/session

export default function HomePage() {
  const items = getFeedForRole(mockFeed, role);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">Good morning</p>
        <h1 className="text-3xl font-bold">Chief-of-Staff Feed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Role: {role.replace('_', ' ')}
        </p>
      </header>

      <FeedList items={items} />
    </main>
  );
}