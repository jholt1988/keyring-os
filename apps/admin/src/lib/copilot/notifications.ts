import { api } from './core';

export async function fetchNotifications(params?: { unread?: boolean; limit?: number }) {
  try {
    const qs = new URLSearchParams();
    if (params?.unread) qs.set('unread', 'true');
    if (params?.limit) qs.set('limit', String(params.limit));
    return await api<unknown[]>(`/notifications?${qs.toString()}`);
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: number) {
  return api(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return api('/notifications/read-all', { method: 'POST' });
}

export async function deleteNotification(id: number) {
  return api(`/notifications/${id}`, { method: 'DELETE' });
}

export const notificationsApi = {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
