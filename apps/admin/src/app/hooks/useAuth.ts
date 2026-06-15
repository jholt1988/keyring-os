'use client';

import { create } from 'zustand';

interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  role?: string;
  roles?: string[];
  organizationId?: string;
}

interface AuthState {
  user: AuthUser | null;
  authStatus: 'unknown' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  authStatus: 'unknown',
  isLoading: true,

  setUser: (user) => {
    set({ user, authStatus: user ? 'authenticated' : 'unauthenticated', isLoading: false });
  },

  logout: async () => {
    await fetch('/api/v2/auth/logout', { method: 'POST' }).catch(() => undefined);
    set({ user: null, authStatus: 'unauthenticated', isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  checkAuth: async () => {
    try {
      const res = await fetch('/api/v2/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const userData = await res.json();
        set({ user: userData, authStatus: 'authenticated', isLoading: false });
      } else {
        set({ user: null, authStatus: 'unauthenticated', isLoading: false });
      }
    } catch {
      set({ user: null, authStatus: 'unauthenticated', isLoading: false });
    }
  },
}));

export async function login(username: string, password: string) {
  const res = await fetch('/api/v2/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? data.statusMessage ?? 'Login failed');
  }

  useAuthStore.getState().setUser(data.user ?? null);
  return data;
}

export async function logout() {
  await useAuthStore.getState().logout();
}

export function useAuthCheck() {
  const { authStatus, isLoading, checkAuth } = useAuthStore();
  return { authStatus, isLoading, checkAuth };
}
