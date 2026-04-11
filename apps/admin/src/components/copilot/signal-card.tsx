'use client';

import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info, DollarSign, ArrowRight } from 'lucide-react';
import type { Signal, Severity } from '@keyring/types';
import { cn } from '@/lib/utils';

const severityConfig: Record<Severity, { border: string; icon: typeof AlertTriangle; iconColor: string; bg: string }> = {
  critical: { border: 'border-l-[#F43F5E]', icon: AlertTriangle, iconColor: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/5' },
  high: { border: 'border-l-[#F43F5E]/70', icon: AlertCircle, iconColor: 'text-[#F43F5E]/80', bg: 'bg-[#F43F5E]/5' },
  medium: { border: 'border-l-[#F59E0B]', icon: Info, iconColor: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/5' },
  low: { border: 'border-l-[#94A3B8]', icon: Info, iconColor: 'text-[#94A3B8]', bg: 'bg-[#0F1B31]' },
};

export function SignalCard({ signal }: { signal: Signal }) {
  const config = severityConfig[signal.severity];
  const Icon = config.icon;

  return (
    <Link
      href={signal.actionUrl}
      className={cn(
        'group flex items-start gap-3 rounded-r-[14px] border-l-4 p-4 transition-all duration-[180ms] hover:bg-[#17304E]/50',
        config.border,
        config.bg,
      )}
    >
      <Icon size={20} className={cn(config.iconColor, 'mt-0.5 shrink-0')} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-[#F8FAFC]">{signal.title}</span>
          {signal.monetaryImpact != null && signal.monetaryImpact > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-[10px] bg-[#F43F5E]/10 px-1.5 py-0.5 font-mono text-xs text-[#F43F5E]">
              <DollarSign size={10} />
              {signal.monetaryImpact.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-[#94A3B8]">{signal.summary}</p>
      </div>
      <ArrowRight size={16} className="mt-1 shrink-0 text-[#94A3B8]/30 transition-colors duration-[180ms] group-hover:text-[#F8FAFC]" />
    </Link>
  );
}
