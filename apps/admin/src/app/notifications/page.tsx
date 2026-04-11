'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, CheckCheck, Trash2, Circle } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/copilot-api';
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
    queryFn: () => fetchNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast('Failed to mark as read', 'error'),
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => { toast('All notifications marked as read'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
    onError: () => toast('Failed to mark all as read', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast('Failed to delete notification', 'error'),
  });

  const unread = (notifications as any[]).filter(n => !n.readAt);
  const read = (notifications as any[]).filter(n => n.readAt);

  return (
    <WorkspaceShell title="Notifications" subtitle="Alerts & System Messages" icon={Bell}
      actions={
        unread.length > 0 ? (
          <Button size="sm" variant="outline" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
            <CheckCheck size={13} /> Mark all read
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}</div>
      ) : (notifications as any[]).length === 0 ? (
        <SectionCard title="No Notifications">
          <div className="py-12 text-center">
            <BellOff size={32} className="mx-auto mb-3 text-[#94A3B8]" />
            <p className="text-sm text-[#94A3B8]">You're all caught up.</p>
          </div>
        </SectionCard>
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <SectionCard title={`Unread (${unread.length})`}>
              <div className="space-y-2">
                {unread.map((n: any) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-[14px] border border-[#1E3350] bg-[#0F1B31] px-4 py-3">
                    <Circle size={8} className="mt-1.5 shrink-0 fill-[#3B82F6] text-[#3B82F6]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#F8FAFC]">{n.title ?? n.message}</p>
                      {n.title && <p className="mt-0.5 text-xs text-[#94A3B8]">{n.message}</p>}
                      <div className="mt-1 flex items-center gap-2">
                        {n.type && (
                          <span className={`text-[10px] font-medium uppercase ${TYPE_COLORS[n.type?.toUpperCase()] ?? 'text-[#94A3B8]'}`}>
                            {n.type}
                          </span>
                        )}
                        <span className="text-[10px] text-[#475569]">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => markReadMutation.mutate(n.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1E3350] bg-[#07111F] text-[#94A3B8] transition-all hover:border-[#3B82F6] hover:text-[#3B82F6]"
                        title="Mark as read">
                        <CheckCheck size={12} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(n.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1E3350] bg-[#07111F] text-[#94A3B8] transition-all hover:border-[#F43F5E] hover:text-[#F43F5E]"
                        title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {read.length > 0 && (
            <SectionCard title={`Read (${read.length})`}>
              <div className="space-y-2">
                {read.map((n: any) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-[14px] border border-[#1E3350] bg-[#07111F] px-4 py-3 opacity-60">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#94A3B8]">{n.title ?? n.message}</p>
                      {n.title && <p className="mt-0.5 text-xs text-[#475569]">{n.message}</p>}
                      <div className="mt-1 flex items-center gap-2">
                        {n.type && (
                          <span className="text-[10px] font-medium uppercase text-[#475569]">{n.type}</span>
                        )}
                        <span className="text-[10px] text-[#475569]">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteMutation.mutate(n.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#1E3350] bg-[#07111F] text-[#475569] transition-all hover:border-[#F43F5E] hover:text-[#F43F5E]"
                      title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </WorkspaceShell>
  );
}
