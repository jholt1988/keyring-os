'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface WorkspaceShellProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function WorkspaceShell({ title, subtitle, icon: Icon, actions, children }: WorkspaceShellProps) {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Back to briefing"
            className="inline-flex size-9 items-center justify-center rounded-[14px] border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] transition-all duration-[180ms] hover:border-[#2B4A73] hover:bg-[#17304E] hover:text-[#F8FAFC]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-2.5">
              <Icon size={22} className="text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-space)] text-xl font-bold tracking-tight text-[#F8FAFC]">{title}</h1>
              {subtitle && <p className="font-mono text-xs tracking-wider text-[#94A3B8]">{subtitle}</p>}
            </div>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
