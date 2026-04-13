'use client';

import type { DecisionWorkflow } from '@keyring/types';
import { GitBranch, Timer } from 'lucide-react';

interface WorkflowTimelineProps {
  workflow?: DecisionWorkflow;
}

export function WorkflowTimeline({ workflow }: WorkflowTimelineProps) {
  if (!workflow) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-[#8DA4C5]">
        No workflow is attached to this decision yet.
      </div>
    );
  }

  const totalStages = workflow.totalStages ?? 1;
  const currentStageIndex = workflow.currentStageIndex ?? 1;
  const progress = Math.max(0, Math.min(100, (currentStageIndex / totalStages) * 100));

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#6E85A5]">Workflow</p>
          <p className="mt-1 text-sm font-medium text-[#F8FAFC]">{workflow.stage}</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-[#D9E8FF]">
          <GitBranch size={12} />
          {currentStageIndex}/{totalStages}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#60A5FA_0%,#10B981_100%)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {workflow.eta && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-[#A9C9FF]">
          <Timer size={12} />
          ETA {workflow.eta}
        </div>
      )}
    </div>
  );
}

export default WorkflowTimeline;
