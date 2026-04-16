'use client';

import { AlertTriangle, Shield, XCircle, CheckCircle, User, Calendar, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TenantViolation {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyAddress: string;
  unit: string;
  type: 'late-payment' | 'noise' | 'pets' | 'unauthorized-occupant' | 'property-damage' | 'lease-violation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  reportedAt: string;
  dueDate?: string;
}

interface TenantViolationCardProps {
  violation: TenantViolation;
  onResolve?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10', border: 'border-[#F43F5E]/30' },
  high: { icon: AlertTriangle, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30' },
  medium: { icon: Shield, color: 'text-[#38BDF8]', bg: 'bg-[#38BDF8]/10', border: 'border-[#38BDF8]/30' },
  low: { icon: Shield, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30' },
};

export function TenantViolationCard({
  violation,
  onResolve,
  onDismiss,
  onViewDetails,
}: TenantViolationCardProps) {
  const config = severityConfig[violation.severity];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5 transition-all hover:border-white/12`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 rounded-lg p-2 ${config.bg}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${config.border} ${config.color}`}>
                {violation.severity}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#64748B]">
                {violation.type.replace(/-/g, ' ')}
              </span>
            </div>
            <h3 className="mt-1 text-sm font-medium text-[#F8FAFC]">{violation.description}</h3>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <User size={12} />
                {violation.tenantName}
              </span>
              <span className="flex items-center gap-1">
                <Home size={12} />
                {violation.propertyAddress} {violation.unit && `Unit ${violation.unit}`}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(violation.reportedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onViewDetails?.(violation.id)}>
          View Details
        </Button>
        <Button size="sm" variant="outline" onClick={() => onResolve?.(violation.id)}>
          <CheckCircle size={12} />
          Resolve
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDismiss?.(violation.id)}>
          <XCircle size={12} />
          Dismiss
        </Button>
      </div>
    </div>
  );
}