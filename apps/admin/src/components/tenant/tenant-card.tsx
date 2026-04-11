'use client';

import Link from 'next/link';
import { ChevronRight, Wrench, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TenantHealthBadge } from './tenant-health-badge';

const statusColors: Record<string, string> = {
  ACTIVE: 'text-[#10B981]',
  DELINQUENT: 'text-[#F43F5E]',
  AT_RISK: 'text-[#F59E0B]',
  RENEWAL_DUE: 'text-[#60A5FA]',
  ONBOARDING: 'text-[#22D3EE]',
  NOTICE_SENT: 'text-[#F59E0B]',
  MOVING_OUT: 'text-[#94A3B8]',
  FORMER: 'text-[#64748B]',
  BLOCKED: 'text-[#F43F5E]',
};

interface TenantCardProps {
  tenant: {
    id: string;
    firstName?: string;
    lastName?: string;
    status: string;
    healthClass: string;
    unit?: string;
    property?: string;
    daysUntilLeaseEnd?: number | null;
    rentAmount?: number | null;
    currentBalance?: number;
    openMaintenanceCount?: number;
    autopayActive?: boolean;
  };
  isSelected?: boolean;
  onClick?: () => void;
}

export function TenantCard({ tenant, isSelected, onClick }: TenantCardProps) {
  const name = [tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || 'Unknown';
  const statusColor = statusColors[tenant.status] ?? 'text-[#94A3B8]';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-[14px] border p-4 transition-all duration-[180ms]',
        isSelected
          ? 'border-[#3B82F6]/40 bg-[#17304E]'
          : 'border-[#1E3350] bg-[#0F1B31] hover:border-[#2B4A73] hover:bg-[#13233C]',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate font-[family-name:var(--font-space)] text-sm font-semibold text-[#F8FAFC]">
            {name}
          </p>
          <p className="mt-0.5 text-xs">
            <span className={cn('font-medium', statusColor)}>
              {tenant.status.replace(/_/g, ' ')}
            </span>
            {tenant.unit && (
              <span className="text-[#64748B]"> · {tenant.unit}</span>
            )}
          </p>
        </div>
        <TenantHealthBadge classification={tenant.healthClass} />
      </div>

      {tenant.daysUntilLeaseEnd != null && tenant.daysUntilLeaseEnd > 0 && (
        <p className="mb-2 flex items-center gap-1 text-[10px] text-[#94A3B8]">
          <Calendar size={10} />
          Lease ends in {tenant.daysUntilLeaseEnd} days
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
          {(tenant.openMaintenanceCount ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[#F59E0B]">
              <Wrench size={10} /> {tenant.openMaintenanceCount} open
            </span>
          )}
          {(tenant.currentBalance ?? 0) > 0 && (
            <span className="text-[#F43F5E]">
              ${tenant.currentBalance?.toLocaleString()} owed
            </span>
          )}
          {tenant.autopayActive && (
            <span className="text-[#10B981]">Autopay</span>
          )}
        </div>
        <Link
          href={`/tenants/${tenant.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[#94A3B8] transition-colors hover:text-[#F8FAFC]"
        >
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
