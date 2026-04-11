'use client';

import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info, DollarSign, ArrowRight } from 'lucide-react';
import type { Signal, Severity } from '@keyring/types';
import { cn } from '@/lib/utils';

const severityConfig: Record<Severity, { border: string; icon: typeof AlertTriangle; iconColor: string; bg: string }> = {
  critical: { border: 'border-l-red-500', icon: AlertTriangle, iconColor: 'text-red-500', bg: 'bg-red-500/5' },
  high: { border: 'border-l-rose-400', icon: AlertCircle, iconColor: 'text-rose-400', bg: 'bg-rose-400/5' },
  medium: { border: 'border-l-amber-400', icon: Info, iconColor: 'text-amber-400', bg: 'bg-amber-400/5' },
  low: { border: 'border-l-muted-foreground', icon: Info, iconColor: 'text-muted-foreground', bg: 'bg-muted/50' },
};

export function SignalCard({ signal }: { signal: Signal }) {
  const config = severityConfig[signal.severity];
  const Icon = config.icon;

  return (
    <Link
      href={signal.actionUrl}
      className={cn(
        'group flex items-start gap-3 rounded-r-lg border-l-4 p-4 transition-colors hover:bg-muted/80',
        config.border,
        config.bg,
      )}
    >
      <Icon size={20} className={cn(config.iconColor, 'mt-0.5 shrink-0')} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{signal.title}</span>
          {signal.monetaryImpact != null && signal.monetaryImpact > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-xs text-destructive">
              <DollarSign size={10} />
              {signal.monetaryImpact.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{signal.summary}</p>
      </div>
      <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
    </Link>
  );
}
