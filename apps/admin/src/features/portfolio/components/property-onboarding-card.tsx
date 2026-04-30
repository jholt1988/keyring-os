'use client';

import { Button } from '@/components/ui/button';
import { Building,Calendar,CheckCircle,DollarSign,Home,MapPin,XCircle } from 'lucide-react';

export interface PropertyOnboardingDecision {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  units: number;
  proposedRent: number;
  propertyType: 'single-family' | 'multi-family' | 'apartment' | 'condo' | 'townhouse';
  decision: 'approve-add' | 'review-details' | 'request-info';
  priority: 'critical' | 'high' | 'medium' | 'low';
  submittedBy: string;
  submittedAt: string;
}

interface PropertyOnboardingCardProps {
  property: PropertyOnboardingDecision;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReview?: (id: string) => void;
}

const priorityConfig = {
  critical: { border: 'border-[#F43F5E]/30', bg: 'bg-[#F43F5E]/8', color: 'text-[#FCA5A5]', badge: 'Critical' },
  high: { border: 'border-[#F59E0B]/30', bg: 'bg-[#F59E0B]/8', color: 'text-[#FCD34D]', badge: 'High' },
  medium: { border: 'border-[#38BDF8]/30', bg: 'bg-[#38BDF8]/8', color: 'text-[#7DD3FC]', badge: 'Medium' },
  low: { border: 'border-white/10', bg: 'bg-white/[0.02]', color: 'text-[#94A3B8]', badge: 'Low' },
};

const typeConfig = {
  'single-family': { label: 'Single Family', icon: Home },
  'multi-family': { label: 'Multi Family', icon: Building },
  'apartment': { label: 'Apartment', icon: Building },
  'condo': { label: 'Condo', icon: Building },
  'townhouse': { label: 'Townhouse', icon: Home },
};

export function PropertyOnboardingCard({
  property,
  onApprove,
  onReject,
  onReview,
}: PropertyOnboardingCardProps) {
  const priority = priorityConfig[property.priority];
  const type = typeConfig[property.propertyType];
  const TypeIcon = type.icon;

  return (
    <div className={`rounded-xl border ${priority.border} ${priority.bg} p-5 transition-all hover:border-white/12`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-[#38BDF8]/10 p-2">
            <TypeIcon className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${priority.border} ${priority.color}`}>
                {priority.badge}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#64748B]">
                {type.label}
              </span>
            </div>
            <h3 className="mt-1 text-sm font-medium text-[#F8FAFC]">{property.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#94A3B8]">
              <MapPin size={12} />
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#94A3B8]">
                <Home size={12} />
                {property.units} units
              </span>
              <span className="flex items-center gap-1 text-[#10B981]">
                <DollarSign size={12} />
                ${property.proposedRent.toLocaleString()}/mo target
              </span>
              <span className="flex items-center gap-1 text-[#64748B]">
                <Calendar size={12} />
                Submitted {new Date(property.submittedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onReview?.(property.id)}>
          Review Details
        </Button>
        <Button size="sm" onClick={() => onApprove?.(property.id)}>
          <CheckCircle size={12} />
          Approve Onboarding
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReject?.(property.id)}>
          <XCircle size={12} />
          Decline
        </Button>
      </div>
    </div>
  );
}