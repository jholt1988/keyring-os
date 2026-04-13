'use client';

import { useState } from 'react';
import { Brain, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Decision, Urgency } from '@keyring/types';
import { cn } from '@/lib/utils';

const urgencyStyle: Record<Urgency, { text: string; cls: string }> = {
  immediate: { text: 'NOW', cls: 'text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/20' },
  today: { text: 'TODAY', cls: 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20' },
  this_week: { text: 'THIS WEEK', cls: 'text-[#94A3B8] bg-[#0F1B31] border border-[#1E3350]' },
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
    const shouldConfirm = action.confirmRequired || action.confirmation;
    if (shouldConfirm) {
      const confirmationMessage = action.confirmation
        ? `${action.confirmation.title}\n\n${action.confirmation.message}`
        : `Are you sure you want to ${action.label.toLowerCase()}?`;
      if (!window.confirm(confirmationMessage)) return;
    }

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
      <div className="rounded-[14px] border border-[#10B981]/20 bg-[#10B981]/5 p-4 text-sm text-[#10B981]">
        Action completed for: {decision.title}
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 transition-all duration-[180ms] hover:border-[#2B4A73]">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn('rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider', urg.cls)}>
          {urg.text}
        </span>
        <span className="font-mono text-[10px] uppercase text-[#94A3B8]">{decision.domain}</span>
      </div>

      <h4 className="text-sm font-semibold text-[#F8FAFC]">{decision.title}</h4>
      <p className="mb-3 text-xs leading-relaxed text-[#94A3B8]">{decision.summary ?? decision.context}</p>

      {decision.reasoning?.length ? (
        <div className="mb-3 rounded-[14px] border border-white/8 bg-black/10 p-3">
          <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#7FA7D9]">
            <Sparkles size={12} />
            Why this surfaced
          </div>
          <ul className="space-y-1 text-xs text-[#CBD5E1]">
            {decision.reasoning.slice(0, 3).map((reason, index) => (
              <li key={`${decision.id}-reason-${index}`} className="leading-relaxed">• {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {decision.aiRecommendation && (
        <div className="mb-3 flex items-start gap-2 rounded-[14px] border border-[#22D3EE]/10 bg-[#22D3EE]/5 p-3">
          <Brain size={14} className="mt-0.5 shrink-0 text-[#22D3EE]" />
          <p className="text-xs text-[#CBD5E1]">{decision.aiRecommendation}</p>
        </div>
      )}

      {result === 'error' && (
        <p className="mb-2 text-xs text-[#F43F5E]">Action failed. Try again.</p>
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

      {decision.priority !== undefined || decision.type ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-[#6E85A5]">
          {decision.type ? (
            <span className="rounded-full border border-white/8 bg-black/10 px-2 py-1">{decision.type.replace(/_/g, ' ')}</span>
          ) : null}
          {decision.priority !== undefined ? (
            <span className="rounded-full border border-white/8 bg-black/10 px-2 py-1">priority {decision.priority}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
