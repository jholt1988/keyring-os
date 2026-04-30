'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface RequireRoleProps {
  requiredRoles: UserRole | UserRole[];
  fallbackRoute?: string;
  children: React.ReactNode;
}

/**
 * Role-protected wrapper component.
 * - If user lacks required role, redirects to fallbackRoute (default: /login)
 * - Shows loading state while checking auth
 */
export function RequireRole({ requiredRoles, fallbackRoute = '/login', children }: RequireRoleProps) {
  const router = useRouter();
  const { isAuthenticated, hasRole, user } = useAuth();

  const shouldRedirect = !isAuthenticated || !hasRole(requiredRoles);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(fallbackRoute);
    }
  }, [fallbackRoute, router, shouldRedirect]);

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  // Logged in but insufficient role - redirect to fallback
  if (!hasRole(requiredRoles)) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-[#F43F5E]/10 p-4">
          <svg
            className="h-8 w-8 text-[#F43F5E]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#F8FAFC]">Access Restricted</h2>
          <p className="mt-2 text-sm text-[#94A3B8]">
            You need {Array.isArray(requiredRoles) ? 'one of' : ''} the{' '}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-[#38BDF8]">
              {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}
            </code>{' '}
            role to view this page.
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            Your current roles: {user?.roles?.join(', ') || 'none'}
          </p>
        </div>
      </div>
    );
  }

  // Has role - render children
  return <>{children}</>;
}