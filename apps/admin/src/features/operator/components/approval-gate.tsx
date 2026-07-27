'use client';

import { useAuth, UserRole } from '@/hooks/use-auth';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ApprovalGateProps {
  requiredRoles: UserRole | UserRole[];
  children: React.ReactNode;
}

export function ApprovalGate({ requiredRoles, children }: ApprovalGateProps) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!isAuthenticated || !hasRole(requiredRoles)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
          <p className="mb-6 text-sm text-[var(--muted)]">
            You do not have the required role to access this view. Please contact an administrator if you need access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
