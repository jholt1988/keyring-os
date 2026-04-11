import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, subtitle, className, children }: SectionCardProps) {
  return (
    <div className={cn('rounded-2xl border bg-card p-5 shadow-sm', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
