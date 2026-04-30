'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle,DollarSign,RefreshCw,XCircle } from 'lucide-react';

export interface RepairEstimate {
  id: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'INVOICED';
  totalProjectCost: number;
  totalLaborCost: number;
  totalMaterialCost: number;
  property?: { name?: string };
  unit?: { name?: string };
  vendor?: { name?: string };
  description?: string;
  createdAt: string;
}

interface EstimateDecisionCardProps {
  estimate: RepairEstimate;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApprovePending?: boolean;
  isRejectPending?: boolean;
}

export function EstimateDecisionCard({
  estimate,
  onApprove,
  onReject,
  isApprovePending,
  isRejectPending,
}: EstimateDecisionCardProps) {
  const isPending = estimate.status === 'PENDING_REVIEW';

  if (!isPending) return null;

  return (
    <div className="rounded-[14px] border border-[#38BDF8]/30 bg-[#38BDF8]/8 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-[#F8FAFC]">
            Estimate #{estimate.id?.slice(-6)}
          </span>
          {estimate.property && (
            <span className="ml-2 text-xs text-[#94A3B8]">
              {estimate.property.name} {estimate.unit?.name ?? ''}
            </span>
          )}
        </div>
        <span className="font-mono text-lg text-[#F43F5E]">
          ${(estimate.totalProjectCost ?? 0).toLocaleString()}
        </span>
      </div>

      <div className="mb-3 flex gap-4 text-xs text-[#94A3B8]">
        <span className="flex items-center gap-1">
          <DollarSign size={12} />
          Labor: ${(estimate.totalLaborCost ?? 0).toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign size={12} />
          Materials: ${(estimate.totalMaterialCost ?? 0).toLocaleString()}
        </span>
      </div>

      {estimate.description && (
        <p className="mb-3 text-xs text-[#94A3B8]">{estimate.description}</p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isApprovePending}
          onClick={() => onApprove?.(estimate.id)}
        >
          {isApprovePending ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <CheckCircle size={12} />
          )}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isRejectPending}
          onClick={() => onReject?.(estimate.id)}
        >
          {isRejectPending ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <XCircle size={12} />
          )}
          Reject
        </Button>
      </div>
    </div>
  );
}

export function EstimateDecisionList({
  estimates,
  onApprove,
  onReject,
  isApprovePending,
  isRejectPending,
}: {
  estimates: RepairEstimate[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApprovePending?: boolean;
  isRejectPending?: boolean;
}) {
  const pendingEstimates = estimates.filter((e) => e.status === 'PENDING_REVIEW');

  if (pendingEstimates.length === 0) {
    return (
      <div className="rounded-lg bg-white/[0.02] px-3 py-2 text-sm text-[#94A3B8]">
        No estimates pending review
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingEstimates.map((est) => (
        <EstimateDecisionCard
          key={est.id}
          estimate={est}
          onApprove={onApprove}
          onReject={onReject}
          isApprovePending={isApprovePending}
          isRejectPending={isRejectPending}
        />
      ))}
    </div>
  );
}