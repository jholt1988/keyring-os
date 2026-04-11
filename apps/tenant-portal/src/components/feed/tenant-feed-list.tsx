'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, Eye } from 'lucide-react';
import type { TenantFeedItem, TenantFeedDomain } from '@keyring/types';
import { cn } from '@/lib/utils';
import { TenantFeedCard } from './tenant-feed-card';
import { Skeleton } from '@/components/ui/skeleton';

const DOMAIN_FILTERS: { label: string; value: TenantFeedDomain | 'all' }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Payments',    value: 'payments' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Lease',       value: 'lease' },
  { label: 'Inspections', value: 'inspection' },
  { label: 'Messages',    value: 'message' },
];

interface TenantFeedListProps {
  items: TenantFeedItem[];
  isLoading: boolean;
  isError: boolean;
  onDismiss: (id: string) => void;
  onRefetch: () => void;
  showDismissed: boolean;
  onToggleDismissed: (v: boolean) => void;
  dismissedCount: number;
  usingFallback: boolean;
}

export function TenantFeedList({
  items,
  isLoading,
  isError,
  onDismiss,
  onRefetch,
  showDismissed,
  onToggleDismissed,
  dismissedCount,
  usingFallback,
}: TenantFeedListProps) {
  const [activeFilter, setActiveFilter] = useState<TenantFeedDomain | 'all'>('all');

  const filtered =
    activeFilter === 'all'
      ? items
      : items.filter((i) => i.domain === activeFilter);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl text-[#F8FAFC]">My Feed</h2>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            {isLoading
              ? 'Loading…'
              : `${filtered.length} item${filtered.length === 1 ? '' : 's'} · tenant`}
            {usingFallback && !isLoading && (
              <span className="ml-2 text-[10px] text-[#94A3B8]/60">(live data)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dismissedCount > 0 && (
            <button
              onClick={() => onToggleDismissed(!showDismissed)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E3350] px-3 py-1.5 text-xs text-[#94A3B8] transition-all hover:border-[#2B4A73] hover:text-[#CBD5E1]"
            >
              <Eye size={12} />
              {showDismissed ? 'Hide dismissed' : `Show ${dismissedCount} dismissed`}
            </button>
          )}
          <button
            onClick={onRefetch}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E3350] px-3 py-1.5 text-xs text-[#94A3B8] transition-all hover:border-[#2B4A73] hover:text-[#CBD5E1]"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* Domain filter chips */}
      <div className="flex flex-wrap gap-2">
        {DOMAIN_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-all',
              activeFilter === f.value
                ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]'
                : 'border-[#1E3350] text-[#94A3B8] hover:border-[#2B4A73] hover:text-[#CBD5E1]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-[14px] border border-[#1E3350] bg-[#13233C] p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-7 w-16 rounded-lg" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-[14px] border border-[#F43F5E]/20 bg-[#F43F5E]/5 py-12 text-center">
          <p className="text-sm text-[#F43F5E]">Failed to load your feed.</p>
          <button
            onClick={onRefetch}
            className="rounded-lg bg-[#17304E] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:bg-[#1E3A5F]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-[14px] border border-[#1E3350] bg-[#13233C] py-16 text-center">
          <CheckCircle2 size={32} className="text-[#10B981]" />
          <p className="font-semibold text-[#F8FAFC]">All clear</p>
          <p className="text-sm text-[#94A3B8]">
            {activeFilter === 'all'
              ? 'No items need your attention right now.'
              : `No ${activeFilter} items right now.`}
          </p>
        </div>
      )}

      {/* Feed grid */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <TenantFeedCard key={item.id} item={item} onDismiss={onDismiss} />
          ))}
        </div>
      )}
    </div>
  );
}
