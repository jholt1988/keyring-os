'use client';

import { AlertTriangle, Wrench, User, Clock } from 'lucide-react';
import { RiskMeter } from '@/components/copilot';
import type { Severity } from '@keyring/types';

export interface RepairRequest {
  id: string;
  title: string;
  description: string;
  priority: 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  property?: { name?: string };
  unit?: { name?: string };
  assignee?: { name?: string };
  dueAt?: string;
  createdAt: string;
}

interface RepairRequestCardProps {
  request: RepairRequest;
  onClick?: (id: string) => void;
}

const priorityConfig = {
  EMERGENCY: { color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10', border: 'border-[#F43F5E]/30', label: 'EMERGENCY' },
  HIGH: { color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30', label: 'HIGH' },
  MEDIUM: { color: 'text-[#38BDF8]', bg: 'bg-[#38BDF8]/10', border: 'border-[#38BDF8]/30', label: 'MEDIUM' },
  LOW: { color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', label: 'LOW' },
};

const priorityToSeverity = (p: string): Severity => {
  switch (p?.toUpperCase()) {
    case 'EMERGENCY': return 'critical';
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    default: return 'low';
  }
};

export function RepairRequestCard({ request, onClick }: RepairRequestCardProps) {
  const config = priorityConfig[request.priority];

  return (
    <div 
      className={`rounded-[14px] border ${config.border} ${config.bg} p-3 transition-all hover:border-white/12 cursor-pointer`}
      onClick={() => onClick?.(request.id)}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="truncate text-sm font-medium text-[#F8FAFC]">{request.title}</span>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>
      <p className="mb-2 line-clamp-2 text-xs text-[#94A3B8]">{request.description}</p>
      <RiskMeter level={priorityToSeverity(request.priority)} />
      {(request.assignee || request.property) && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-[#94A3B8]">
          {request.assignee && (
            <span className="flex items-center gap-1">
              <User size={10} />
              {request.assignee.name ?? 'Assigned'}
            </span>
          )}
          {request.property && (
            <span>{request.property.name} {request.unit?.name ?? ''}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function RepairRequestList({ 
  requests, 
  onItemClick 
}: { 
  requests: RepairRequest[];
  onItemClick?: (id: string) => void;
}) {
  const criticalRequests = requests.filter((r) => ['EMERGENCY', 'HIGH'].includes(r.priority));

  if (criticalRequests.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[#10B981]/10 px-3 py-2 text-sm text-[#10B981]">
        <AlertTriangle size={14} />
        No critical repairs
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {criticalRequests.map((req) => (
        <RepairRequestCard key={req.id} request={req} onClick={onItemClick} />
      ))}
    </div>
  );
}