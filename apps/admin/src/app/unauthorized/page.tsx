'use client';

import { ShieldAlert } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <WorkspaceShell
      title="Access Denied"
      subtitle="Insufficient permissions"
      icon={ShieldAlert}
    >
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="mb-4 h-16 w-16 text-[#F43F5E]" />
        <h1 className="mb-2 text-2xl font-bold text-[#F8FAFC]">Unauthorized Access</h1>
        <p className="mb-6 max-w-md text-[#94A3B8]">
          You do not have the required role to access this page. Please contact your system administrator if you believe this is a mistake.
        </p>
        <Link href="/">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    </WorkspaceShell>
  );
}
