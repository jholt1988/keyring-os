'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Gauge,
  Calendar,
  CheckCircle2,
  ArrowRight,
  X,
} from 'lucide-react';
import type { TenantFeedItem } from '@keyring/types';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelative } from '@/lib/utils';
import { DomainIcon, getDomainConfig } from './domain-icon';

const KIND_CONFIG = {
  critical_signal: {
    icon: ShieldAlert,
    borderColor: 'border-[#F43F5E]/40',
    badgeClass: 'bg-[#F43F5E]/10 text-[#F43F5E]',
    label: 'Alert',
    barColor: '#F43F5E',
  },
  decision: {
    icon: Gauge,
    borderColor: 'border-[#3B82F6]/40',
    badgeClass: 'bg-[#3B82F6]/10 text-[#3B82F6]',
    label: 'Action needed',
    barColor: '#3B82F6',
  },
  scheduled_event: {
    icon: Calendar,
    borderColor: 'border-[#94A3B8]/30',
    badgeClass: 'bg-[#94A3B8]/10 text-[#94A3B8]',
    label: 'Upcoming',
    barColor: '#94A3B8',
  },
  update: {
    icon: CheckCircle2,
    borderColor: 'border-[#10B981]/30',
    badgeClass: 'bg-[#10B981]/10 text-[#10B981]',
    label: 'Update',
    barColor: '#10B981',
  },
} as const;

interface TenantFeedCardProps {
  item: TenantFeedItem;
  onDismiss: (id: string) => void;
}

export function TenantFeedCard({ item, onDismiss }: TenantFeedCardProps) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState(false);

  const kind = KIND_CONFIG[item.kind] ?? KIND_CONFIG.update;
  const KindIcon = kind.icon;
  const domainConfig = getDomainConfig(item.domain);

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    setDismissing(true);
    setTimeout(() => onDismiss(item.id), 220);
  }

  function handleView() {
    router.push(item.navigateTo);
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-[14px] border bg-[#13233C] transition-all duration-[180ms]',
        'hover:border-[#2B4A73] hover:shadow-[0_4px_24px_rgba(2,6,23,0.3)]',
        kind.borderColor,
        item.isDismissed && 'opacity-40',
        dismissing && 'feed-card-dismiss',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <DomainIcon domain={item.domain} size={15} />
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: domainConfig.color }}
          >
            {domainConfig.label}
          </span>
          <span className="text-[#1E3350]">·</span>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', kind.badgeClass)}>
            <KindIcon size={10} />
            {kind.label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.financialImpact != null && (
            <span className="font-mono text-xs font-bold text-[#3B82F6]">
              {formatCurrency(item.financialImpact)}
            </span>
          )}
          <span className="text-[11px] text-[#94A3B8]">
            {formatRelative(item.timestamp)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-[15px] leading-snug text-[#F8FAFC] mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-[#94A3B8] line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <button
          onClick={handleView}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#17304E] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] transition-all hover:bg-[#1E3A5F] active:scale-95"
        >
          View
          <ArrowRight size={12} />
        </button>
        <button
          onClick={handleDismiss}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[#94A3B8] transition-all hover:bg-[#1E3350] hover:text-[#CBD5E1] active:scale-95"
        >
          <X size={12} />
          Dismiss
        </button>
      </div>

      {/* Priority bar */}
      <div className="h-[3px] w-full overflow-hidden rounded-b-[14px] bg-[#0F1B31]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${item.priority}%`,
            backgroundColor: kind.barColor,
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}
