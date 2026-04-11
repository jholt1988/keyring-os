import { Brain, ArrowRight, Lightbulb } from 'lucide-react';

interface ExplainableActionProps {
  trigger: string;
  reasoning: string;
  recommendation: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function ExplainableAction({ trigger, reasoning, recommendation, onAction, actionLabel }: ExplainableActionProps) {
  return (
    <div className="space-y-3 rounded-[14px] border border-[#22D3EE]/10 bg-[#22D3EE]/5 p-4">
      <div className="flex items-start gap-2">
        <Lightbulb size={14} className="mt-0.5 shrink-0 text-[#F59E0B]" />
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">TRIGGER</p>
          <p className="text-xs text-[#CBD5E1]">{trigger}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Brain size={14} className="mt-0.5 shrink-0 text-[#22D3EE]" />
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">REASONING</p>
          <p className="text-xs text-[#CBD5E1]">{reasoning}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#1E3350] pt-2">
        <p className="text-sm font-medium text-[#F8FAFC]">{recommendation}</p>
        {onAction && (
          <button onClick={onAction} className="inline-flex items-center gap-1 text-xs text-[#3B82F6] transition-colors duration-[180ms] hover:text-[#F8FAFC]">
            {actionLabel || 'Execute'} <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
