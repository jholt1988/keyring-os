'use client';

import { Home, ArrowRight, ArrowLeft, Clock, CheckCircle, XCircle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type UnitStatus = 'vacant' | 'available' | 'occupied' | 'maintenance' | 'reserved' | 'off-market';

export interface UnitDecision {
  id: string;
  unitId: string;
  propertyId: string;
  propertyAddress: string;
  unitNumber: string;
  currentStatus: UnitStatus;
  targetStatus?: UnitStatus;
  decision: 'approve-transition' | 'review-marketing' | 'approve-pricing' | 'ready-to-lease';
  priority: 'critical' | 'high' | 'medium' | 'low';
  amount?: number; // rent amount for pricing decisions
  daysVacant?: number;
  reason: string;
  createdAt: string;
}

interface UnitDecisionCardProps {
  unit: UnitDecision;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewProperty?: (propertyId: string) => void;
}

const statusConfig = {
  vacant: { label: 'Vacant', color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10', icon: Home },
  available: { label: 'Available', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: Building },
  occupied: { label: 'Occupied', color: 'text-[#38BDF8]', bg: 'bg-[#38BDF8]/10', icon: Home },
  maintenance: { label: 'Maintenance', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', icon: Home },
  reserved: { label: 'Reserved', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', icon: Home },
  'off-market': { label: 'Off Market', color: 'text-[#64748B]', bg: 'bg-[#64748B]/10', icon: Home },
};

const priorityConfig = {
  critical: { border: 'border-[#F43F5E]/30', bg: 'bg-[#F43F5E]/8', color: 'text-[#FCA5A5]' },
  high: { border: 'border-[#F59E0B]/30', bg: 'bg-[#F59E0B]/8', color: 'text-[#FCD34D]' },
  medium: { border: 'border-[#38BDF8]/30', bg: 'bg-[#38BDF8]/8', color: 'text-[#7DD3FC]' },
  low: { border: 'border-white/10', bg: 'bg-white/[0.02]', color: 'text-[#94A3B8]' },
};

export function UnitDecisionCard({
  unit,
  onApprove,
  onReject,
  onViewProperty,
}: UnitDecisionCardProps) {
  const status = statusConfig[unit.currentStatus];
  const priority = priorityConfig[unit.priority];
  const StatusIcon = status.icon;

  const decisionActions = {
    'approve-transition': { label: 'Approve Transition', icon: ArrowRight },
    'review-marketing': { label: 'Review Marketing', icon: Building },
    'approve-pricing': { label: 'Approve Pricing', icon: CheckCircle },
    'ready-to-lease': { label: 'Mark Ready to Lease', icon: Home },
  };

  const action = decisionActions[unit.decision];

  return (
    <div className={`rounded-xl border ${priority.border} ${priority.bg} p-5 transition-all hover:border-white/12`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 rounded-lg p-2 ${status.bg}`}>
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${priority.border} ${priority.color}`}>
                {unit.priority}
              </span>
              <span className={`rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider ${status.color}`}>
                {status.label}
              </span>
              {unit.daysVacant && (
                <span className="flex items-center gap-1 text-xs text-[#64748B]">
                  <Clock size={12} />
                  {unit.daysVacant} days vacant
                </span>
              )}
            </div>
            <h3 className="mt-1 text-sm font-medium text-[#F8FAFC]">
              Unit {unit.unitNumber}
            </h3>
            <p className="mt-1 text-xs text-[#94A3B8]">{unit.reason}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
              <span>{unit.propertyAddress}</span>
              {unit.amount && (
                <span className="rounded-full bg-white/5 px-2 py-0.5">
                  ${unit.amount.toLocaleString()}/mo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onViewProperty?.(unit.propertyId)}>
          View Property
        </Button>
        {action && (
          <Button size="sm" onClick={() => onApprove?.(unit.id)}>
            {action.icon && <action.icon size={12} />}
            {action.label}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onReject?.(unit.id)}>
          <XCircle size={12} />
          Reject
        </Button>
      </div>
    </div>
  );
}