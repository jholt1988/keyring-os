import { cn } from '@/lib/utils';

interface MetricCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
}

const variantStyles: Record<string, string> = {
  default: 'border-[#1E3350] bg-[#13233C]',
  danger: 'border-[#F43F5E]/20 bg-[#F43F5E]/5',
  warning: 'border-[#F59E0B]/20 bg-[#F59E0B]/5',
  info: 'border-[#38BDF8]/20 bg-[#38BDF8]/5',
  success: 'border-[#10B981]/20 bg-[#10B981]/5',
};

const valueColor: Record<string, string> = {
  default: 'text-[#F8FAFC]',
  danger: 'text-[#F43F5E]',
  warning: 'text-[#F59E0B]',
  info: 'text-[#38BDF8]',
  success: 'text-[#10B981]',
};

export function MetricCard({ value, label, variant = 'default' }: MetricCardProps) {
  return (
    <div className={cn('rounded-[18px] border p-4 text-center', variantStyles[variant])}>
      <p className={cn('font-[family-name:var(--font-space)] text-2xl font-bold', valueColor[variant])}>{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">{label}</p>
    </div>
  );
}
