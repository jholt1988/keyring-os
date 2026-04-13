'use client';

import type { ReactNode } from 'react';
import { CommandNode } from './command-node';
import { CommandComposer } from './command-composer';
import { ContextRail } from './context-rail';
import { RadialMenu } from './radial-menu';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,rgba(23,48,78,0.42),transparent_48%),linear-gradient(180deg,#07111F_0%,#081221_100%)]">
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
              <div className="w-full max-w-xl">
                <CommandComposer />
              </div>
            </div>
          </div>
        </header>
        <div className="pb-24">{children}</div>
      </div>
      <RadialMenu />
      <CommandNode />
    </>
  );
}
