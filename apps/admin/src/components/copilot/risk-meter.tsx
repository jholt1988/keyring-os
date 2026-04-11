import type { Severity } from '@keyring/types';
import { cn } from '@/lib/utils';

const config: Record<Severity, { width: string; color: string; label: string }> = {
  low: { width: 'w-1/4', color: 'bg-[#94A3B8]', label: 'Low Risk' },
  medium: { width: 'w-2/4', color: 'bg-[#F59E0B]', label: 'Medium Risk' },
  high: { width: 'w-3/4', color: 'bg-[#F43F5E]/80', label: 'High Risk' },
  critical: { width: 'w-full', color: 'bg-[#F43F5E]', label: 'Critical Risk' },
};

export function RiskMeter({ level, className }: { level: Severity; className?: string }) {
  const c = config[level];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1E3350]">
        <div className={cn('h-full rounded-full transition-all duration-500', c.width, c.color)} />
      </div>
      <span className="whitespace-nowrap font-mono text-[10px] uppercase text-[#94A3B8]">{c.label}</span>
    </div>
  );
}
