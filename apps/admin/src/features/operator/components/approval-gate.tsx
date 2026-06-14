'use client';

import { useState } from 'react';
import { useAuth, UserRole } from '@/hooks/use-auth';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ApprovalGateProps {
  requiredRoles: UserRole | UserRole[];
  children: React.ReactNode;
}

export function ApprovalGate({ requiredRoles, children }: ApprovalGateProps) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  const handleRequestApproval = () => {
    setRequestStatus('pending');
    // Mocking an API call to request approval
    setTimeout(() => {
      setRequestStatus('success');
      console.log('Approval requested via API (mock)');
    }, 1000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  // Not logged in or insufficient role
  if (!isAuthenticated || !hasRole(requiredRoles)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Action Requires Approval</h2>
          <p className="mb-6 text-sm text-[var(--muted)]">
            You do not have the required permissions to access this view or perform this action. You can request temporary approval from an administrator.
          </p>
          
          <button
            onClick={handleRequestApproval}
            disabled={requestStatus !== 'idle'}
            className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-50"
          >
            {requestStatus === 'idle' && 'Request Approval'}
            {requestStatus === 'pending' && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requesting...</>}
            {requestStatus === 'success' && 'Approval Requested'}
          </button>
        </div>
      </div>
    );
  }

  // Has role - render children
  return <>{children}</>;
}
