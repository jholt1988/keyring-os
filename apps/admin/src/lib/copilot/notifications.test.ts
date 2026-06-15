import { describe, expect, it, vi } from 'vitest';
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications';

describe('notifications api', () => {
  it('fetchNotifications returns [] on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));
    await expect(fetchNotifications()).resolves.toEqual([]);
  });

  it('calls mutation endpoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await markNotificationRead(1);
    await markAllNotificationsRead();
    await deleteNotification(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
