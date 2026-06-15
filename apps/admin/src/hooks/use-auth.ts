'use client';

import { useCallback, useEffect, useState } from 'react';

export type UserRole = 'ADMIN' | 'OWNER' | 'PROPERTY_MANAGER' | 'TENANT';

interface AuthUser {
  id: string;
  username?: string;
  email?: string;
  roles?: UserRole[];
  role?: UserRole;
}

function userRoles(user: AuthUser | null): UserRole[] {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles;
  return user.role ? [user.role] : [];
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/v2/auth/me', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<AuthUser>;
      })
      .then((nextUser) => {
        if (!cancelled) setUser(nextUser);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasRole = useCallback(
    (requiredRoles: UserRole | UserRole[]): boolean => {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      return userRoles(user).some((role) => roles.includes(role));
    },
    [user]
  );

  const isAdmin = useCallback((): boolean => hasRole('ADMIN'), [hasRole]);
  const isPropertyManager = useCallback((): boolean => hasRole(['ADMIN', 'PROPERTY_MANAGER']), [hasRole]);
  const isOwner = useCallback((): boolean => hasRole(['ADMIN', 'PROPERTY_MANAGER', 'OWNER']), [hasRole]);

  const logout = useCallback(async () => {
    await fetch('/api/v2/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null);
    window.location.href = '/login';
  }, []);

  return {
    user,
    token: null,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    isAdmin,
    isPropertyManager,
    isOwner,
    logout,
  };
}
