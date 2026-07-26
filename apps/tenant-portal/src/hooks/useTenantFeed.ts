import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTenantFeed } from '@/lib/tenant-api';
import type { TenantFeedItem } from '@keyring/types';

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

// FeedItemData is now identical to TenantFeedItem — kept for backward compat
export type FeedItemData = TenantFeedItem;

export function useTenantFeed() {
  // Lazy-init from localStorage — avoids setState-in-effect lint warning
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set<string>();
    return getDismissed();
  });
  const [showDismissed, setShowDismissed] = useState(false);

  const primaryQuery = useQuery({
    queryKey: ['tenant-feed'],
    queryFn: fetchTenantFeed,
    refetchInterval: 60_000,
    retry: (failureCount, error) => {
      console.warn('useTenantFeed primary fetch failed:', error);
      return failureCount < 2;
    },
  });

  const allItems: TenantFeedItem[] = primaryQuery.data?.items ?? [];
  const items: TenantFeedItem[] = allItems.filter(
    (item) => item?.id && (showDismissed || !dismissed.has(item.id))
  );

  const dismissedCount = dismissed.size;
  const unreadCount = items.filter((item) => item.isDismissed !== true).length;
  const usingFallback = primaryQuery.isError;

  const dismiss = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(next);
      return next;
    });
  };

  return {
    items,
    unreadCount,
    dismiss,
    isLoading: primaryQuery.isLoading,
    isError: primaryQuery.isError,
    error: primaryQuery.error,
    refetch: primaryQuery.refetch,
    showDismissed,
    setShowDismissed,
    dismissedCount,
    usingFallback,
  };
}
