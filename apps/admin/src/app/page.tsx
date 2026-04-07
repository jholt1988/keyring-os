import type { UserRole } from '@keyring/types';
import { fetchFeed, FeedApiError } from '@/lib/feed-api';
import { FeedList } from '@/components/feed/feed-list';
import { mockFeed, getFeedForRole } from '@keyring/types';

// Phase 4: derive from auth session
const role: UserRole = 'property_manager';

export default async function HomePage() {
  let items = getFeedForRole(mockFeed, role);
  let source: 'live' | 'mock' = 'mock';

  try {
    const feed = await fetchFeed(role);
    items = feed.items;
    source = 'live';
  } catch (err) {
    // Backend unavailable — fall back to mock data so the UI stays usable.
    // FeedApiError means the backend is reachable but returned an error status.
    // Any other error means the backend is unreachable (not started, wrong URL, etc.)
    if (err instanceof FeedApiError) {
      console.error(`[feed] Backend error ${err.status}: ${err.message}`);
    } else {
      console.warn('[feed] Backend unreachable, using mock data:', (err as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">Good morning</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Co-Pilot Feed
        </h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {role.replace('_', ' ')} &middot; {items.length} item
          {items.length !== 1 ? 's' : ''} require attention
          {source === 'mock' && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
              mock data
            </span>
          )}
        </p>
      </header>

      <FeedList items={items} role={role} />
    </main>
  );
}