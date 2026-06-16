import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTenantFeed } from '@/lib/tenant-api';

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem('dismissed-feed-items');
    return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function saveDismissed(items: Set<string>): void {
  try {
    localStorage.setItem('dismissed-feed-items', JSON.stringify([...items]));
  } catch {}
}

export interface FeedItemData {
  id: string;
  message: string;
  createdAt: string;
  domain: string;
  read: boolean;
}

export function useTenantFeed() {
  const [showDismissed, setShowDismissed] = useState(false);


  // Hydrate dismissed set from localStorage after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(getDismissed());
  }, []);

  // Primary: try /tenant/feed
  const primaryQuery = useQuery({
    queryKey: ['tenant-feed'],
    queryFn: fetchTenantFeed,
    refetchInterval: 60_000,
    retry: (failureCount, error) => {
      console.warn('useTenantFeed primary fetch failed:', error);
      return failureCount < 2;
    },
  });

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const items: FeedItemData[] =
    (primaryQuery.data?.items ?? []).filter((item: { id?: string }) => item?.id && !dismissed.has(item.id));

  const unreadCount = items.filter((item: { read?: boolean }) => !item?.read).length;

  const dismiss = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(next);
      return next;
    });
  };


  return { items, unreadCount, dismiss, isLoading: primaryQuery.isLoading, error: primaryQuery.error };
}
