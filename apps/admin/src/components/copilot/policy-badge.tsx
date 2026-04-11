import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Verdict = 'approve' | 'conditional' | 'deny';

const config: Record<Verdict, { icon: typeof CheckCircle; label: string; cls: string }> = {
  approve: { icon: CheckCircle, label: 'APPROVE', cls: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' },
  conditional: { icon: AlertTriangle, label: 'CONDITIONAL', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' },
  deny: { icon: XCircle, label: 'DENY', cls: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400' },
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
