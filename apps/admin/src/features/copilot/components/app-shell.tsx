'use client';

import type { ReactNode } from 'react';
import { AmbientSignalCluster } from './ambient-signal-cluster';
import { BriefingProvider, useBriefingContext } from './briefing-context';
import { CommandComposer } from './command-composer';
import { CommandNode } from './command-node';
import { ContextPanel } from './context-panel';
import { ContextRail } from './context-rail';
import { MinimalSidebar } from './minimal-sidebar';
import { RadialMenu } from './radial-menu';
import { OperatorDataProvider, useOperatorSignals } from '@/features/operator/context/operator-data-context';

// Inner shell that consumes both BriefingContext and OperatorDataContext
function ShellInner({ children }: { children: ReactNode }) {
  const { signals: briefingSignals, panelOpen, openPanel, closePanel, selectedDecision } = useBriefingContext();

  // Merge operator signals with briefing signals — operator takes priority
  let ambientSignals: { id: string; severity: 'critical' | 'high' | 'medium' | 'low'; label: string; pulse?: boolean }[] = [];
  try {
    const operatorSignals = useOperatorSignals();
    // Use operator signals if available, fall back to briefing signals
    ambientSignals = operatorSignals.length > 0
      ? operatorSignals
      : briefingSignals.map(s => ({ ...s, label: (s as any).title || (s as any).type || 'Signal' })) as any;
  } catch {
    // Operator context not available — use briefing signals
    ambientSignals = briefingSignals.map(s => ({ ...s, label: (s as any).title || (s as any).type || 'Signal' })) as any;
  }

  return (
    <>
      <MinimalSidebar />
      <div className="relative min-h-screen pl-20 bg-[radial-gradient(circle_at_top,rgba(23,48,78,0.42),transparent_48%),linear-gradient(180deg,#07111F_0%,#081221_100%)]">
        {/* Ambient signals wired to operator data (with briefing fallback) */}
        <AmbientSignalCluster signals={ambientSignals} />
        <ContextRail />
        <header className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div className="glass-panel rounded-[28px] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#60A5FA]/15 bg-[#60A5FA]/8 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#A9C9FF]">
                  Decision operating system
                </div>
                <div>
                  <h1 className="font-[family-name:var(--font-space)] text-2xl font-semibold tracking-tight text-[#F8FAFC] sm:text-3xl">
                    Render decisions, not dashboards.
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8DA4C5]">
                    Brief first. Command second. Execution only when intent is clear.
                  </p>
                </div>
              </div>
              <div className="w-full max-w-xl space-y-3">
                <CommandComposer />
                {/* Panel toggle tracks selectedDecision from context */}
                <button
                  type="button"
                  onClick={() => (panelOpen ? closePanel() : openPanel())}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#D9E8FF] transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                >
                  {panelOpen ? 'Hide context panel' : 'Preview context panel'}
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="pb-24">{children}</div>
      </div>
      {/* ContextPanel receives the live selected decision from context */}
      <ContextPanel open={panelOpen} onClose={closePanel} decision={selectedDecision} />
      <RadialMenu />
      <CommandNode />
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <OperatorDataProvider>
      <BriefingProvider>
        <ShellInner>{children}</ShellInner>
      </BriefingProvider>
    </OperatorDataProvider>
  );
}
