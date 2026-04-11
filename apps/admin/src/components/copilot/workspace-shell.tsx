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
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Back to briefing"
            className="inline-flex size-8 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border bg-muted p-2">
              <Icon size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
