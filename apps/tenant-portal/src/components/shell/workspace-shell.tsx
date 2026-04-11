import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TenantHeader } from './tenant-header';

interface WorkspaceShellProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function WorkspaceShell({
  title,
  backHref,
  backLabel = 'Back',
  actions,
  children,
}: WorkspaceShellProps) {
  return (
    <>
      <TenantHeader title={title} />
      <div className="p-6">
        {backHref && (
          <Link
            href={backHref}
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#94A3B8] transition-colors hover:text-[#F8FAFC]"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </Link>
        )}
        {actions && (
          <div className="mb-5 flex items-center justify-end gap-2">{actions}</div>
        )}
        <div className="flex flex-col gap-5">{children}</div>
      </div>
    </>
  );
}
