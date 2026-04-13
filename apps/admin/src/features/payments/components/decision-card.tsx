'use client';

import type { ReactElement } from 'react';
import type { Decision } from '@keyring/types';
import { AlertCircle, Check, Clock, Sparkles, X } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
  onExecute: (endpoint: string, method: string, body?: Record<string, unknown>) => void;
  onDismiss: (id: string) => void;
}

function formatImpact(financial?: number) {
  if (typeof financial !== 'number') return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(financial);
}

function typeBadgeTone(type?: Decision['type']) {
  switch (type) {
    case 'approval':
      return 'border-[#10B981]/25 bg-[#10B981]/10 text-[#7EE7BA]';
    case 'escalation':
      return 'border-[#F43F5E]/25 bg-[#F43F5E]/10 text-[#FDA4AF]';
    case 'review':
    default:
      return 'border-[#60A5FA]/20 bg-[#60A5FA]/10 text-[#A9C9FF]';
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
}

export function DecisionCard({ decision, onExecute, onDismiss }: DecisionCardProps): ReactElement {
  const primaryAction = decision.actions[0];
  const financialImpact = formatImpact(decision.impact?.financial);

  const handleApprove = () => {
    if (!primaryAction) return;
    onExecute(primaryAction.endpoint, primaryAction.method, primaryAction.body);
  };

  const handleDismiss = () => {
    onDismiss(decision.id);
  };

  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] transition-all duration-[180ms] hover:border-white/12 hover:bg-white/[0.04]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]">
            <AlertCircle size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {decision.type && (
                    <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${typeBadgeTone(decision.type)}`}>
                      <Sparkles size={12} />
                      {capitalize(decision.type)}
                    </div>
                  )}
                  {typeof decision.priority === 'number' && (
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-[#D9E8FF]">
                      P{decision.priority}
                    </div>
                  )}
                  {typeof decision.confidenceScore === 'number' && (
                    <div className="inline-flex items-center rounded-full border border-[#60A5FA]/20 bg-[#60A5FA]/8 px-2.5 py-1 text-[11px] font-medium text-[#A9C9FF]">
                      {decision.confidenceScore}% confidence
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <h3 className="min-w-0 flex-1 text-base font-semibold text-[#F8FAFC] sm:text-lg">
                    {decision.title}
                  </h3>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="ml-2 text-[#6E85A5] transition-colors hover:text-[#F8FAFC]"
                    aria-label="Dismiss decision"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="mt-1 text-sm text-[#8DA4C5]">{decision.context}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/8 px-2.5 py-1 text-[11px] text-[#F9D38B]">
                <Clock size={12} />
                {decision.urgency}
              </div>
              {decision.aiRecommendation && (
                <div className="inline-flex items-center gap-1 rounded-full border border-[#60A5FA]/20 bg-[#60A5FA]/8 px-2.5 py-1 text-[11px] text-[#A9C9FF]">
                  AI: {decision.aiRecommendation}
                </div>
              )}
            </div>

            {!!decision.reasoning?.length && (
              <div className="mt-4 rounded-2xl border border-white/8 bg-[#081221]/70 p-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#6E85A5]">
                  Reasoning
                </p>
                <ul className="space-y-1.5">
                  {decision.reasoning.map((item, index) => (
                    <li key={`${decision.id}-reason-${index}`} className="text-sm text-[#D7E4F5]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {decision.impact && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#C8D7EA]">
                {financialImpact && (
                  <div className="rounded-full border border-[#10B981]/20 bg-[#10B981]/8 px-2.5 py-1 text-[#9AE6B4]">
                    {financialImpact} impact
                  </div>
                )}
                {decision.impact.risk && (
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                    Risk: {capitalize(decision.impact.risk)}
                  </div>
                )}
                {decision.impact.timeline && (
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                    Timeline: {decision.impact.timeline}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={!primaryAction}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={14} />
                {primaryAction?.label || 'Approve'}
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-[#C8D7EA] transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                Review Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecisionCard;
