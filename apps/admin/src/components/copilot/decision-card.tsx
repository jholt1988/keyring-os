'use client';

import { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Decision, Urgency } from '@keyring/types';
import { cn } from '@/lib/utils';

const urgencyStyle: Record<Urgency, { text: string; cls: string }> = {
  immediate: { text: 'NOW', cls: 'text-red-500 bg-red-500/10' },
  today: { text: 'TODAY', cls: 'text-amber-500 bg-amber-500/10' },
  this_week: { text: 'THIS WEEK', cls: 'text-muted-foreground bg-muted' },
};

const variantMap = (v?: string): 'default' | 'destructive' | 'outline' => {
  if (v === 'danger') return 'destructive';
  if (v === 'neutral') return 'outline';
  return 'default';
};

interface DecisionCardProps {
  decision: Decision;
  onExecute: (endpoint: string, method: string, body?: Record<string, unknown>) => Promise<void>;
  onDismiss?: (id: string) => void;
}

export function DecisionCard({ decision, onExecute, onDismiss }: DecisionCardProps) {
  const [executing, setExecuting] = useState<string | null>(null);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const urg = urgencyStyle[decision.urgency];

  const handleAction = async (action: Decision['actions'][0]) => {
    if (action.confirmRequired) return;
    setExecuting(action.label);
    setResult(null);
    try {
      await onExecute(action.endpoint, action.method, action.body);
      setResult('success');
      onDismiss?.(decision.id);
    } catch {
      setResult('error');
    } finally {
      setExecuting(null);
    }
  };

  if (result === 'success') {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-600 dark:text-green-400">
        Action completed for: {decision.title}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/20">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn('rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider', urg.cls)}>
          {urg.text}
        </span>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">{decision.domain}</span>
      </div>

      <h4 className="text-sm font-semibold">{decision.title}</h4>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{decision.context}</p>

      {decision.aiRecommendation && (
        <div className="mb-3 flex items-start gap-2 rounded border border-violet-500/10 bg-violet-500/5 p-2">
          <Brain size={14} className="mt-0.5 shrink-0 text-violet-500" />
          <p className="text-xs text-muted-foreground">{decision.aiRecommendation}</p>
        </div>
      )}

      {result === 'error' && (
        <p className="mb-2 text-xs text-destructive">Action failed. Try again.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {decision.actions.map((action) => (
          <Button
            key={action.label}
            size="sm"
            variant={variantMap(action.variant)}
            onClick={() => handleAction(action)}
            disabled={!!executing}
          >
            {executing === action.label && <Loader2 size={12} className="animate-spin" />}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
