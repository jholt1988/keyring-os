'use client';

import type { Decision } from '@keyring/types';
import { Clock3, Link2, X } from 'lucide-react';
import { WorkflowTimeline } from './workflow-timeline';

interface ContextPanelProps {
  open: boolean;
  onClose: () => void;
  decision?: Decision | null;
}

export function ContextPanel({ open, onClose, decision }: ContextPanelProps) {
  return (
    <aside
      className={`fixed right-0 top-0 z-40 h-full w-full max-w-md border-l border-white/10 bg-[#081221]/95 shadow-[0_18px_60px_rgba(2,8,23,0.45)] backdrop-blur-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between border-b border-white/8 px-5 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#6E85A5]">Decision context</p>
            <h2 className="mt-2 text-lg font-semibold text-[#F8FAFC]">
              {decision?.title ?? 'No decision selected'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-[#8DA4C5] transition-colors hover:border-white/20 hover:text-[#F8FAFC]"
            aria-label="Close decision context panel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#6E85A5]">Context</p>
            <p className="mt-2 text-sm leading-relaxed text-[#D7E4F5]">
              {decision?.context ?? 'Select a decision card to inspect supporting reasoning, workflow status, and nearby actions.'}
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#6E85A5]">
              <Clock3 size={12} />
              Reasoning
            </div>
            {decision?.reasoning?.length ? (
              <div className="space-y-2">
                {decision.reasoning.map((item, index) => (
                  <div key={`${decision.id}-panel-reason-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm text-[#D7E4F5]">
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-[#8DA4C5]">
                No reasoning trace is available yet.
              </div>
            )}
          </section>

          <section>
            <WorkflowTimeline workflow={decision?.workflow} />
          </section>

          <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#6E85A5]">
              <Link2 size={12} />
              Related decisions
            </div>
            <p className="mt-2 text-sm text-[#D7E4F5]">
              {decision?.relatedDecisionIds?.length
                ? `${decision.relatedDecisionIds.length} connected decision${decision.relatedDecisionIds.length === 1 ? '' : 's'} available.`
                : 'No related decisions are linked yet.'}
            </p>
          </section>
        </div>
      </div>
    </aside>
  );
}

export default ContextPanel;
