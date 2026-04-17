// Decision Card - P0 Design Items 8 & 9
// Action-first design with inline actions, replaces data tables

'use client';

import { useState } from 'react';
import { 
  AlertCircle, 
  Clock, 
  Home, 
  ChevronRight, 
  CheckCircle2,
  Loader2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type UrgencyLevel = 'immediate' | 'today' | 'this_week' | 'later';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

interface DecisionCardProps {
  id: string;
  title: string;
  subtitle?: string;
  severity?: SeverityLevel;
  urgency?: UrgencyLevel;
  domain: string;
  entityId?: string;
  context?: string;
  metadata?: Record<string, unknown>;
  actions?: DecisionAction[];
  lastAction?: string;
  onAction?: (actionId: string, entityId: string) => void;
  className?: string;
}

interface DecisionAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  icon?: React.ElementType;
}

const severityColors: Record<SeverityLevel, string> = {
  critical: 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/30',
  high: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
  medium: 'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/30',
  low: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
};

const severityBg: Record<SeverityLevel, string> = {
  critical: 'bg-[#F43F5E]',
  high: 'bg-[#F59E0B]',
  medium: 'bg-[#60A5FA]',
  low: 'bg-[#10B981]',
};

const urgencyLabels: Record<UrgencyLevel, string> = {
  immediate: 'Now',
  today: 'Today',
  this_week: 'This week',
  later: 'Later',
};

export function DecisionCard({
  id,
  title,
  subtitle,
  severity = 'medium',
  urgency = 'this_week',
  domain,
  entityId,
  context,
  actions = [],
  lastAction,
  onAction,
  className,
}: DecisionCardProps) {
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleAction = async (action: DecisionAction) => {
    if (!entityId) return;
    
    setExecutingAction(action.id);
    
    // Simulate action execution with animation
    await new Promise(resolve => setTimeout(resolve, 400));
    
    setExecutingAction(null);
    onAction?.(action.id, entityId);
  };

  return (
    <div 
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-lg',
        'bg-[#13233C] border-[#1E3350] hover:border-[#60A5FA]/30',
        'hover:translate-y-[-2px]',
        className
      )}
    >
      {/* Severity indicator bar */}
      <div className={cn('h-1 w-full', severityBg[severity])} />
      
      <div className="p-4">
        {/* Header: Severity + Title + Urgency */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {severity === 'critical' && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F43F5E] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F43F5E]"></span>
              </span>
            )}
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {urgency !== 'later' && (
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                severityColors[severity]
              )}>
                <Clock className="h-3 w-3" />
                {urgencyLabels[urgency]}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-[#94A3B8] opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {/* Meta info */}
        {(subtitle || context) && (
          <p className="mb-3 text-sm text-[#94A3B8]">
            {subtitle && <span>{subtitle}</span>}
            {subtitle && context && <span className="mx-2">•</span>}
            {context && <span>{context}</span>}
          </p>
        )}

        {/* Domain badge */}
        <div className="mb-4">
          <span className="inline-flex items-center rounded-lg bg-[#0F1B31] px-2 py-1 text-xs text-[#94A3B8]">
            {domain}
          </span>
        </div>

        {/* Action buttons - Primary action first */}
        {actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {actions.slice(0, 3).map((action) => {
              const Icon = action.icon;
              const isExecuting = executingAction === action.id;
              
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  disabled={isExecuting}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
                    'hover:scale-[0.98] active:scale-[0.96]',
                    action.variant === 'primary' 
                      ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]' 
                      : action.variant === 'destructive'
                      ? 'bg-[#F43F5E]/10 text-[#F43F5E] hover:bg-[#F43F5E]/20 border border-[#F43F5E]/30'
                      : 'bg-[#17304E] text-[#94A3B8] hover:text-white hover:bg-[#1E3350]',
                    isExecuting && 'cursor-wait opacity-70'
                  )}
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : Icon ? (
                    <Icon className="h-4 w-4" />
                  ) : action.id === 'quick' ? (
                    <Zap className="h-4 w-4" />
                  ) : null}
                  {action.label}
                </button>
              );
            })}
            
            {actions.length > 3 && (
              <button className="text-sm text-[#94A3B8] hover:text-white">
                +{actions.length - 3} more
              </button>
            )}
          </div>
        )}

        {/* Last action indicator */}
        {lastAction && (
          <div className="mt-3 flex items-center gap-1 text-xs text-[#10B981]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Last action: {lastAction}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty state with action drive
interface EmptyDecisionStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ElementType;
}

export function EmptyDecisionState({ 
  title, 
  description, 
  action,
  icon: Icon = CheckCircle2 
}: EmptyDecisionStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/10">
        <Icon className="h-8 w-8 text-[#10B981]" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-[#94A3B8]">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}