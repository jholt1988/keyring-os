import { cn } from '@/lib/utils';

interface MetricCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
}

const variantStyles: Record<string, string> = {
  default: 'border-border',
  danger: 'border-red-500/20 bg-red-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  info: 'border-blue-500/20 bg-blue-500/5',
  success: 'border-green-500/20 bg-green-500/5',
};

const valueColor: Record<string, string> = {
  default: 'text-foreground',
  danger: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  success: 'text-green-500',
};

export function MetricCard({ value, label, variant = 'default' }: MetricCardProps) {
  return (
    <div className={cn('rounded-xl border p-4 text-center', variantStyles[variant])}>
      <p className={cn('text-2xl font-light', valueColor[variant])}>{value}</p>
      <p className="mt-1 font-mono text-xs uppercase text-muted-foreground">{label}</p>
    </div>
  );
}
