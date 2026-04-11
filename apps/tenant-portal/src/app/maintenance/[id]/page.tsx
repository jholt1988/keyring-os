'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, RefreshCw, MessageSquare, Send } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchMaintenanceRequest,
  addMaintenanceNote,
  confirmMaintenanceComplete,
} from '@/lib/tenant-api';
import { formatDate, formatRelative } from '@/lib/utils';

function statusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':     return <Badge variant="warning">Open</Badge>;
    case 'IN_PROGRESS': return <Badge variant="info">In Progress</Badge>;
    case 'COMPLETED':   return <Badge variant="success">Completed</Badge>;
    case 'CLOSED':      return <Badge variant="muted">Closed</Badge>;
    default:            return <Badge variant="muted">{status}</Badge>;
  }
}

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const { data: req, isLoading } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => fetchMaintenanceRequest(id),
  });

  const noteMutation = useMutation({
    mutationFn: () => addMaintenanceNote(id, note),
    onSuccess: () => {
      setNote('');
      qc.invalidateQueries({ queryKey: ['maintenance', id] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => confirmMaintenanceComplete(id),
    onSuccess: () => {
      setConfirmed(true);
      qc.invalidateQueries({ queryKey: ['maintenance', id] });
      qc.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  if (isLoading) {
    return (
      <WorkspaceShell title="Request Detail" backHref="/maintenance" backLabel="Maintenance">
        <Skeleton className="h-40 w-full rounded-[14px]" />
        <Skeleton className="h-32 w-full rounded-[14px]" />
      </WorkspaceShell>
    );
  }

  if (!req) {
    return (
      <WorkspaceShell title="Request Detail" backHref="/maintenance" backLabel="Maintenance">
        <p className="text-center text-sm text-[#94A3B8]">Request not found.</p>
      </WorkspaceShell>
    );
  }

  const isCompleted = req.status.toUpperCase() === 'COMPLETED';

  return (
    <WorkspaceShell title={req.title} backHref="/maintenance" backLabel="Maintenance">
      {/* Request summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base">{req.title}</CardTitle>
            {statusBadge(req.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#94A3B8]">Category</p>
                <p className="font-medium text-[#F8FAFC]">{req.category ?? '—'}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Priority</p>
                <p className="font-medium text-[#F8FAFC]">{req.priority}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Submitted</p>
                <p className="font-medium text-[#F8FAFC]">{formatDate(req.createdAt)}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Last updated</p>
                <p className="font-medium text-[#F8FAFC]">{formatRelative(req.updatedAt)}</p>
              </div>
            </div>
            <div className="border-t border-[#1E3350] pt-3">
              <p className="text-sm text-[#94A3B8]">Description</p>
              <p className="mt-1 text-sm text-[#F8FAFC] leading-relaxed">{req.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm complete */}
      {isCompleted && !confirmed && (
        <Card className="border-[#10B981]/30 bg-[#10B981]/5">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[#10B981] shrink-0" />
                <div>
                  <p className="font-semibold text-[#F8FAFC]">Repair marked complete</p>
                  <p className="text-sm text-[#94A3B8]">
                    Confirm the work is done to close this request.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="shrink-0"
              >
                {completeMutation.isPending ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Confirm
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {confirmed && (
        <Card className="border-[#10B981]/30 bg-[#10B981]/5">
          <CardContent className="pt-5">
            <p className="flex items-center gap-2 text-sm text-[#10B981]">
              <CheckCircle2 size={16} /> Request closed. Thank you for confirming.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add note */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#94A3B8]" />
            <CardTitle>Add a Note</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note or update for your property manager…"
              className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#3B82F6] resize-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => noteMutation.mutate()}
                disabled={!note.trim() || noteMutation.isPending}
              >
                {noteMutation.isPending ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                Send Note
              </Button>
            </div>
            {noteMutation.isSuccess && (
              <p className="text-xs text-[#10B981]">Note sent.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
