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
    <div className="space-y-3 rounded-lg border border-violet-500/10 bg-violet-500/5 p-4">
      <div className="flex items-start gap-2">
        <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-400" />
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">TRIGGER</p>
          <p className="text-xs text-muted-foreground">{trigger}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Brain size={14} className="mt-0.5 shrink-0 text-violet-500" />
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">REASONING</p>
          <p className="text-xs text-muted-foreground">{reasoning}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t pt-2">
        <p className="text-sm font-medium">{recommendation}</p>
        {onAction && (
          <button onClick={onAction} className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-foreground">
            {actionLabel || 'Execute'} <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
