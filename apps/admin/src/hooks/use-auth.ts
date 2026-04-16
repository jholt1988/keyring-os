'use client';

import { useCallback, useMemo } from 'react';

export type UserRole = 'ADMIN' | 'OWNER' | 'PROPERTY_MANAGER' | 'TENANT';

interface AuthUser {
  id: string;
  username: string;
  roles: UserRole[];
}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function useAuth() {
  const user = useMemo(() => getStoredUser(), []);
  const token = useMemo(() => getStoredToken(), []);
  const isAuthenticated = !!token && !!user;

  const hasRole = useCallback(
    (requiredRoles: UserRole | UserRole[]): boolean => {
      if (!user?.roles) return false;
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      return user.roles.some((role) => roles.includes(role));
    },
    [user]
  );

  const isAdmin = useCallback((): boolean => {
    return hasRole('ADMIN');
  }, [hasRole]);

  const isPropertyManager = useCallback((): boolean => {
    return hasRole(['ADMIN', 'PROPERTY_MANAGER']);
  }, [hasRole]);

  const isOwner = useCallback((): boolean => {
    return hasRole(['ADMIN', 'PROPERTY_MANAGER', 'OWNER']);
  }, [hasRole]);

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    hasRole,
    isAdmin,
    isPropertyManager,
    isOwner,
    logout,
  };
}