'use client';

import { cn } from '@/lib/utils';

const healthConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  STABLE: { label: 'Stable', bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/20' },
  WATCH: { label: 'Watch', bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/20' },
  AT_RISK: { label: 'At Risk', bg: 'bg-[#F43F5E]/10', text: 'text-[#F43F5E]', border: 'border-[#F43F5E]/20' },
  HIGH_TOUCH: { label: 'High Touch', bg: 'bg-[#A78BFA]/10', text: 'text-[#A78BFA]', border: 'border-[#A78BFA]/20' },
};

interface TenantHealthBadgeProps {
  classification: string;
  className?: string;
}

export function TenantHealthBadge({ classification, className }: TenantHealthBadgeProps) {
  const config = healthConfig[classification] ?? healthConfig.STABLE;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        config.border,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.text.replace('text-', 'bg-'))} />
      {config.label}
    </span>
  );
}
