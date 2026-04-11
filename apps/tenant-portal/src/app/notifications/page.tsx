'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, CheckCheck, Circle } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchNotifications,
  markNotificationRead,
  type Notification,
} from '@/lib/tenant-api';
import { formatRelative } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  PAYMENT: 'Payment',
  MAINTENANCE: 'Maintenance',
  LEASE: 'Lease',
  INSPECTION: 'Inspection',
  GENERAL: 'General',
  ALERT: 'Alert',
};

function typeBadge(type?: string) {
  if (!type) return null;
  const label = TYPE_LABELS[type.toUpperCase()] ?? type;
  switch (type.toUpperCase()) {
    case 'PAYMENT':     return <Badge variant="info">{label}</Badge>;
    case 'MAINTENANCE': return <Badge variant="warning">{label}</Badge>;
    case 'LEASE':       return <Badge variant="success">{label}</Badge>;
    case 'ALERT':       return <Badge variant="destructive">{label}</Badge>;
    default:            return <Badge variant="muted">{label}</Badge>;
  }
}

// ── Notification Row ──────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
}) {
  return (
    <div
      className={`flex items-start gap-4 rounded-lg border px-4 py-3 transition-colors ${
        notification.isRead
          ? 'border-[#1E3350] bg-[#0F1B31]'
          : 'border-[#2B4A73] bg-[#0F1B31] shadow-[0_0_0_1px_rgba(59,130,246,0.1)]'
      }`}
    >
      {/* Read indicator */}
      <div className="mt-0.5 shrink-0">
        {notification.isRead ? (
          <Circle size={8} className="text-[#1E3350] fill-[#1E3350]" />
        ) : (
          <Circle size={8} className="text-[#3B82F6] fill-[#3B82F6]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`text-sm font-medium leading-snug ${
              notification.isRead ? 'text-[#94A3B8]' : 'text-[#F8FAFC]'
            }`}
          >
            {notification.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {typeBadge(notification.type)}
            {!notification.isRead && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                title="Mark as read"
              >
                <CheckCheck size={14} />
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-[#94A3B8] leading-relaxed">{notification.message}</p>
        <p className="mt-1.5 text-xs text-[#475569]">{formatRelative(notification.createdAt)}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => fetchNotifications(),
    refetchInterval: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayed = showUnreadOnly ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <WorkspaceShell title="Notifications">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#94A3B8]" />
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F43F5E] px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Unread filter toggle */}
              <button
                onClick={() => setShowUnreadOnly((v) => !v)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  showUnreadOnly
                    ? 'bg-[#3B82F6] text-white'
                    : 'border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] hover:border-[#2B4A73] hover:text-[#F8FAFC]'
                }`}
              >
                Unread only
              </button>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  <CheckCheck size={13} />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-12 text-center">
              <BellOff size={32} className="mx-auto mb-3 text-[#94A3B8]" />
              <p className="text-sm text-[#94A3B8]">
                {showUnreadOnly ? 'No unread notifications.' : 'No notifications yet.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {displayed.map((n: Notification) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markReadMutation.mutate(id)}
                />
              ))}
            </div>
          )}

          {!isLoading && notifications.length > 0 && (
            <p className="mt-3 text-xs text-[#94A3B8]">
              {unreadCount} unread · {notifications.length} total
            </p>
          )}
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
