'use client';

import { useQuery, useMutation, useQueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Bell, BellOff, CheckCheck, Trash2, Circle } from 'lucide-react';
import NotificationsView from './notifications-view';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import {
  loadOperatorNotifications,
  markOperatorNotificationRead,
  markAllOperatorNotificationsRead,
  deleteOperatorNotification,
} from '@/lib/operator/read-only-data';
import { useToast } from '@/components/ui/toast';

const TYPE_COLORS: Record<string, string> = {
  PAYMENT: 'text-[#10B981]',
  MAINTENANCE: 'text-[#F59E0B]',
  LEASE: 'text-[#3B82F6]',
  INSPECTION: 'text-[#8B5CF6]',
  ALERT: 'text-[#F43F5E]',
  SYSTEM: 'text-[#94A3B8]',
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => loadOperatorNotifications({}),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markOperatorNotificationRead(id, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast('Failed to mark as read', 'error'),
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllOperatorNotificationsRead({}),
    onSuccess: () => { toast('All notifications marked as read'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
    onError: () => toast('Failed to mark all as read', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOperatorNotification(id, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast('Failed to delete notification', 'error'),
  });

  const unread = (notifications as any[]).filter(n => !n.readAt);
  const read = (notifications as any[]).filter(n => n.readAt);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotificationsView />
    </HydrationBoundary>
  );
}
