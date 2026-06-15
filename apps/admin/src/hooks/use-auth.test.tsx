import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from './use-auth';

describe('useAuth', () => {
  it('loads authenticated user and role helpers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', roles: ['ADMIN'] }),
      }),
    );

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isPropertyManager()).toBe(true);
  });

  it('handles failed auth fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.hasRole('ADMIN')).toBe(false);
  });

  it('logout posts and clears user', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1', role: 'OWNER' }) })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const location = { href: 'https://app.test/' };
    Object.defineProperty(window, 'location', {
      value: location,
      writable: true,
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(fetchMock).toHaveBeenLastCalledWith('/api/v2/auth/logout', { method: 'POST' });
    expect(location.href).toBe('/login');
    expect(result.current.isAuthenticated).toBe(false);
  });
});
