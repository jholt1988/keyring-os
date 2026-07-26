'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TenantFeedItem } from '@keyring/types';
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
  } catch {
    /* localStorage unavailable — dismissals just won't persist */
  }
}

/**
 * Tenant feed state.
 *
 * Returns the full surface `FeedPage` / `TenantFeedList` consume:
 * `TenantFeedItem[]` (not the old ad-hoc shape), plus error/refetch and the
 * dismissed-items controls. Dismissal is a client-only concern (localStorage),
 * so it lives here rather than in the query. The `['tenant-feed']` query is
 * prefetched by the Server Component wrapper and served from the hydrated cache.
 */
export function useTenantFeed() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);

  // Hydrate the dismissed set from localStorage after mount (client-only).
  useEffect(() => {
    setDismissed(getDismissed());
  }, []);

  const query = useQuery({
    queryKey: ['tenant-feed'],
    queryFn: fetchTenantFeed,
    refetchInterval: 60_000,
  });

  const all: TenantFeedItem[] = (query.data?.items ?? []).filter((item) => Boolean(item?.id));
  const items = showDismissed ? all : all.filter((item) => !dismissed.has(item.id));

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
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
    dismiss,
    showDismissed,
    setShowDismissed,
    dismissedCount: dismissed.size,
    // No client-side synthesis fallback is currently wired; data is always live.
    usingFallback: false,
  };
}
