import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, subtitle, className, actions, children }: SectionCardProps) {
  return (
    <div className={cn('rounded-[24px] border border-[#1E3350] bg-[#13233C] p-6 shadow-[0_8px_30px_rgba(2,6,23,0.20)]', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-space)] text-sm font-semibold tracking-tight text-[#F8FAFC]">{title}</h3>
          {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
