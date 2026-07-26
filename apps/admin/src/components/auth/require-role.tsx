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
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !hasRole(requiredRoles)) {
        router.replace(fallbackRoute);
      }
    }
  }, [isLoading, isAuthenticated, hasRole, requiredRoles, fallbackRoute, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  // Not logged in or insufficient role - prevent flash before redirect
  if (!isAuthenticated || !hasRole(requiredRoles)) {
    return null;
  }

  // Has role - render children
  return <>{children}</>;
}