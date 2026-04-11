import type { Severity } from '@keyring/types';
import { cn } from '@/lib/utils';

const config: Record<Severity, { width: string; color: string; label: string }> = {
  low: { width: 'w-1/4', color: 'bg-muted-foreground', label: 'Low Risk' },
  medium: { width: 'w-2/4', color: 'bg-amber-500', label: 'Medium Risk' },
  high: { width: 'w-3/4', color: 'bg-rose-500', label: 'High Risk' },
  critical: { width: 'w-full', color: 'bg-red-600', label: 'Critical Risk' },
};

export function RiskMeter({ level, className }: { level: Severity; className?: string }) {
  const c = config[level];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all duration-500', c.width, c.color)} />
      </div>
      <span className="whitespace-nowrap font-mono text-[10px] uppercase text-muted-foreground">{c.label}</span>
    </div>
  );
}
