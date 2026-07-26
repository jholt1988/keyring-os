import { apiRequest } from '@/lib/operator/api/client';

export async function fetchNotifications(params?: { unread?: boolean; limit?: number }) {
  return apiRequest<any[]>('get', '/api/notifications', { query: params as any });
}

export async function markNotificationRead(id: number) {
  return apiRequest('put', (`/api/notifications/${id}/read` as unknown) as any);
}

export async function markAllNotificationsRead() {
  return apiRequest('post', '/api/notifications/read-all');
}

export async function deleteNotification(id: number) {
  return apiRequest('delete', (`/api/notifications/${id}` as unknown) as any);
}

export const notificationsApi = {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
