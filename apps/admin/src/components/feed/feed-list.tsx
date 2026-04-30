'use client'
import { useCoPilotFeed } from '@/app/hooks/useCoPilotFeed';
import type { FeedItem,UserRole } from '@keyring/types';
import { Filter,Inbox,Loader2 } from 'lucide-react';
import React,{ useMemo } from 'react';
import { ActuarialFeedCard } from './ActuarialFeedCard';

type FeedListProps = {
  role: UserRole;
};

export function FeedList({}: FeedListProps) {
 const { items, userRole, isLoading, performAction } = useCoPilotFeed();

const sortedItems = useMemo(() => {
  if (!userRole) return items;

  return [...items].sort((a, b) => {
    const weightA = a.roleWeights?.[userRole] ?? 0;
    const weightB = b.roleWeights?.[userRole] ?? 0;

    if (weightB !== weightA) {
      return weightB - weightA;
    }

    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    const urgencyA = a.urgencyHours ?? 999;
    const urgencyB = b.urgencyHours ?? 999;
    
    return urgencyA - urgencyB;
  });
}, [items, userRole]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#1E3350] p-12 text-center">
        <Inbox className="mb-4 h-12 w-12 text-[#94A3B8]/50" />
        <h3 className="font-[family-name:var(--font-space)] text-lg font-semibold text-[#F8FAFC]">Clear Skies</h3>
        <p className="text-sm text-[#94A3B8]">No critical signals or pending actuarial reviews.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-space)] text-2xl font-bold tracking-tight text-[#F8FAFC]">Operation Feed</h2>
          <p className="text-sm text-[#94A3B8]">
            Role: <span className="font-mono font-bold uppercase text-[#3B82F6]">{userRole}</span> 
            {' '}&bull; {items.length} active signals
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[14px] border border-[#1E3350] bg-[#0F1B31] px-3 py-1.5 text-sm font-medium text-[#CBD5E1] transition-all duration-[180ms] hover:border-[#2B4A73] hover:bg-[#17304E]">
          <Filter size={14} />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedItems.map((item: FeedItem) => (
          <ActuarialFeedCard 
            key={item.id} 
            item={item} 
            onAction={(intent) => {
              const action = item.actions.find((candidate) => candidate.type === 'mutation' && candidate.intent === intent);
              if (!action || action.type !== 'mutation') {
                throw new Error(`Mutation action not found for intent: ${intent}`);
              }
              performAction.mutate({ item, action });
            }} 
          />
        ))}
      </div>
    </div>
  );
};
