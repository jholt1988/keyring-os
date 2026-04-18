'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  authStatus: 'unknown' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
  
  // Actions
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      authStatus: 'unknown',
      isLoading: true,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setUser: (user) => {
        set({ user, authStatus: 'authenticated', isLoading: false });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          authStatus: 'unauthenticated',
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      checkAuth: async () => {
        const { accessToken, user } = get();
        if (!accessToken || !user) {
          set({ authStatus: 'unauthenticated', isLoading: false });
          return;
        }
        
        try {
          const res = await fetch('/api/v2/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          
          if (res.ok) {
            const userData = await res.json();
            set({ user: userData, authStatus: 'authenticated', isLoading: false });
          } else {
            set({ authStatus: 'unauthenticated', isLoading: false });
          }
        } catch {
          set({ authStatus: 'unauthenticated', isLoading: false });
        }
      },
    }),
    {
      name: 'keyring-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

// Login function
export async function login(email: string, password: string) {
  const res = await fetch('/api/v2/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message);
  }

  const data = await res.json();
  const { useAuthStore } = await import('./useAuth');
  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
  useAuthStore.getState().setUser(data.user);
  
  return data;
}

// Logout function
export async function logout() {
  const { accessToken } = useAuthStore.getState();
  
  if (accessToken) {
    try {
      await fetch('/api/v2/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // Ignore logout errors
    }
  }
  
  useAuthStore.getState().logout();
}

// Auth check hook for components
export function useAuthCheck() {
  const { authStatus, isLoading, checkAuth } = useAuthStore();
  
  return { authStatus, isLoading, checkAuth };
}