'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

interface WorkspaceShellProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function WorkspaceShell({ title, subtitle, icon: Icon, actions, children }: WorkspaceShellProps) {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="glass-panel rounded-[26px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <Link
              href="/"
              aria-label="Back to briefing"
              className="inline-flex size-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-[#A9BEDB] transition-all duration-[180ms] hover:border-[#60A5FA]/30 hover:bg-white/[0.06] hover:text-[#F8FAFC]"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-start gap-3">
              <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
                <Icon size={22} className="text-[#60A5FA]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8DA4C5]">
                  Execution surface
                  <ArrowUpRight size={12} />
                </div>
                <h1 className="mt-3 font-[family-name:var(--font-space)] text-2xl font-semibold tracking-tight text-[#F8FAFC]">{title}</h1>
                {subtitle && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8DA4C5]">{subtitle}</p>}
              </div>
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
