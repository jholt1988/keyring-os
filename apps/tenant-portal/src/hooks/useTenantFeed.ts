'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import type { TenantFeedItem } from '@keyring/types';
import {
  fetchTenantFeed,
  fetchTenantDashboard,
  fetchInvoices,
  fetchMaintenanceRequests,
  fetchMyLease,
  fetchSigningEnvelopes,
  fetchRenewalOffers,
} from '@/lib/tenant-api';
import { synthesizeFeed } from '@/lib/synthesize-feed';

const DISMISSED_KEY = 'dismissed_feed_items';

function getDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function useTenantFeed() {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);

  // Hydrate dismissed set from localStorage after mount
  useEffect(() => {
    setDismissed(getDismissed());
  }, []);

  // Primary: try /tenant/feed
  const primaryQuery = useQuery({
    queryKey: ['tenant-feed'],
    queryFn: fetchTenantFeed,
    refetchInterval: 60_000,
    retry: 1,
  });

  // Fallback data sources — only fetched if primary fails or is empty
  const needsFallback =
    !primaryQuery.isLoading &&
    (primaryQuery.isError || (primaryQuery.data?.items?.length ?? 0) === 0);

  const dashboardQuery = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: fetchTenantDashboard,
    enabled: needsFallback,
  });

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    enabled: needsFallback,
  });

  const maintenanceQuery = useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenanceRequests,
    enabled: needsFallback,
  });

  const leaseQuery = useQuery({
    queryKey: ['my-lease'],
    queryFn: fetchMyLease,
    enabled: needsFallback,
  });

  const envelopesQuery = useQuery({
    queryKey: ['envelopes', leaseQuery.data?.id],
    queryFn: () => fetchSigningEnvelopes(leaseQuery.data!.id),
    enabled: needsFallback && !!leaseQuery.data?.id,
  });

  const renewalOffersQuery = useQuery({
    queryKey: ['renewal-offers', leaseQuery.data?.id],
    queryFn: () => fetchRenewalOffers(leaseQuery.data!.id),
    enabled: needsFallback && !!leaseQuery.data?.id,
  });

  // Compute final items
  let rawItems: TenantFeedItem[] = [];

  if (!needsFallback && primaryQuery.data?.items) {
    rawItems = primaryQuery.data.items;
  } else if (needsFallback) {
    rawItems = synthesizeFeed({
      dashboard: dashboardQuery.data,
      invoices: invoicesQuery.data,
      maintenance: maintenanceQuery.data,
      lease: leaseQuery.data,
      envelopes: envelopesQuery.data,
      renewalOffers: renewalOffersQuery.data,
    });
  }

  const items = showDismissed
    ? rawItems.map((item) => ({ ...item, isDismissed: dismissed.has(item.id) }))
    : rawItems.filter((item) => !dismissed.has(item.id));

  const dismiss = useCallback(
    (id: string) => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        saveDismissed(next);
        return next;
      });
    },
    [],
  );

  const clearDismissed = useCallback(() => {
    setDismissed(new Set());
    saveDismissed(new Set());
  }, []);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tenant-feed'] });
  }, [queryClient]);

  const isLoading =
    primaryQuery.isLoading ||
    (needsFallback &&
      (dashboardQuery.isLoading ||
        invoicesQuery.isLoading ||
        maintenanceQuery.isLoading));

  const dismissedCount = rawItems.filter((i) => dismissed.has(i.id)).length;

  return {
    items,
    isLoading,
    isError: primaryQuery.isError && !needsFallback,
    dismiss,
    clearDismissed,
    refetch,
    showDismissed,
    setShowDismissed,
    dismissedCount,
    totalCount: rawItems.length,
    usingFallback: needsFallback,
  };
}
