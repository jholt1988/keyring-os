'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { AmbientSignalCluster } from './ambient-signal-cluster';
import { ContextPanel } from './context-panel';
import { CommandNode } from './command-node';
import { CommandComposer } from './command-composer';
import { ContextRail } from './context-rail';
import { RadialMenu } from './radial-menu';
import { MinimalSidebar } from './minimal-sidebar';
import { QuickActionsBar } from './quick-actions-bar';

export function AppShell({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <MinimalSidebar />
      <div className="relative min-h-screen pl-20 bg-[radial-gradient(circle_at_top,rgba(23,48,78,0.42),transparent_48%),linear-gradient(180deg,#07111F_0%,#081221_100%)]">
        <AmbientSignalCluster
          signals={[
            { id: 'portfolio-risk', severity: 'high', label: '3 risks surfacing', pulse: true },
            { id: 'workflow-drift', severity: 'medium', label: '2 workflows active' },
          ]}
        />
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
                <button
                  type="button"
                  onClick={() => setPanelOpen((current) => !current)}
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
      <ContextPanel open={panelOpen} onClose={() => setPanelOpen(false)} decision={null} />
      <RadialMenu />
      <CommandNode />
    </>
  );
}
