import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Verdict = 'approve' | 'conditional' | 'deny';

const config: Record<Verdict, { icon: typeof CheckCircle; label: string; cls: string }> = {
  approve: { icon: CheckCircle, label: 'APPROVE', cls: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' },
  conditional: { icon: AlertTriangle, label: 'CONDITIONAL', cls: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' },
  deny: { icon: XCircle, label: 'DENY', cls: 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20' },
};

export function PolicyBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  const c = config[verdict];
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs uppercase tracking-wider', c.cls, className)}>
      <Icon size={12} />
      {c.label}
    </span>
  );
}
