'use client'
import React, { useMemo } from 'react';
import type { FeedItem, UserRole } from '@keyring/types';
import { FeedCard } from './feed-card';
import { ActuarialFeedCard } from './actuarial-feed-card';
import { useCoPilotFeed } from '@/app/hooks/useCoPilotFeed';
import { Loader2, Inbox, Filter } from 'lucide-react';

type FeedListProps = {

  role: UserRole;
};

export function FeedList({ role: _role }: FeedListProps) {
 const { items, userRole, isLoading, performAction } = useCoPilotFeed();

  // Sort by Priority (Backend pre-computed) and then by Urgency
const sortedItems = useMemo(() => {
  if (!userRole) return items;

  return [...items].sort((a, b) => {
    // 1. Primary Sort: Role-Specific Weighting
    const weightA = a.roleWeights?.[userRole] ?? 0;
    const weightB = b.roleWeights?.[userRole] ?? 0;

    if (weightB !== weightA) {
      return weightB - weightA;
    }

    // 2. Secondary Sort: Global Priority Score (0-100)
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    // 3. Tertiary Sort: Urgency (Hours remaining)
    // We want the lowest hours (soonest deadline) at the top
    const urgencyA = a.urgencyHours ?? 999;
    const urgencyB = b.urgencyHours ?? 999;
    
    return urgencyA - urgencyB;
  });
}, [items, userRole]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
        <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold">Clear Skies</h3>
        <p className="text-sm text-muted-foreground">No critical signals or pending actuarial reviews.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feed Header with Contextual Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operation Feed</h2>
          <p className="text-sm text-muted-foreground">
            Role: <span className="font-mono font-bold uppercase text-primary">{userRole}</span> 
            • {items.length} active signals
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-secondary">
          <Filter size={14} />
          Filter
        </button>
      </div>

      {/* Responsive Masonry-style Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedItems.map((item: FeedItem) => (
          <ActuarialFeedCard 
            key={item.id} 
            item={item} 
            onAction={(intent) => performAction.mutate({ itemId: item.id, intent })} 
          />
        ))}
      </div>
    </div>
  );
};