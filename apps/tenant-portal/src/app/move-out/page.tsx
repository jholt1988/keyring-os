'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LogOut, CalendarDays, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMyLease, submitMoveOutNotice } from '@/lib/tenant-api';
import { formatDate, daysUntil } from '@/lib/utils';

// Minimum date: today + notice period days
function minMoveOutDate(noticeDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + noticeDays);
  return d.toISOString().split('T')[0];
}

export default function MoveOutPage() {
  const [moveOutDate, setMoveOutDate] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: lease, isLoading } = useQuery({
    queryKey: ['my-lease'],
    queryFn: fetchMyLease,
  });

  const mutation = useMutation({
    mutationFn: () =>
      submitMoveOutNotice(lease!.id, { moveOutDate, reason: reason || undefined }),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  if (isLoading) {
    return (
      <WorkspaceShell title="Move-Out Notice">
        <Skeleton className="h-40 w-full rounded-[14px]" />
      </WorkspaceShell>
    );
  }

  if (!lease) {
    return (
      <WorkspaceShell title="Move-Out Notice">
        <Card>
          <CardContent className="py-12 text-center">
            <LogOut size={32} className="mx-auto mb-3 text-[#94A3B8]" />
            <p className="text-sm text-[#94A3B8]">No active lease found.</p>
          </CardContent>
        </Card>
      </WorkspaceShell>
    );
  }

  // Already submitted a move-out notice
  if (lease.moveOutAt) {
    return (
      <WorkspaceShell title="Move-Out Notice">
        <Card className="border-[#10B981]/30 bg-[#10B981]/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-[#10B981] shrink-0" />
              <div>
                <p className="font-semibold text-[#F8FAFC]">Move-out notice on file</p>
                <p className="text-sm text-[#94A3B8] mt-0.5">
                  Your scheduled move-out date is{' '}
                  <strong className="text-[#F8FAFC]">{formatDate(lease.moveOutAt)}</strong>.
                </p>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Contact your property manager if you need to make changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </WorkspaceShell>
    );
  }

  if (submitted) {
    return (
      <WorkspaceShell title="Move-Out Notice">
        <Card className="border-[#10B981]/30 bg-[#10B981]/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-[#10B981] shrink-0" />
              <div>
                <p className="font-semibold text-[#F8FAFC]">Notice submitted</p>
                <p className="text-sm text-[#94A3B8] mt-0.5">
                  Your move-out notice for{' '}
                  <strong className="text-[#F8FAFC]">{formatDate(moveOutDate)}</strong> has been
                  sent to your property manager.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </WorkspaceShell>
    );
  }

  const minDate = minMoveOutDate(lease.noticePeriodDays);
  const leaseEndDate = lease.endDate;
  const daysToEnd = daysUntil(leaseEndDate);
  const canSubmit = moveOutDate.length > 0 && confirmed;

  return (
    <WorkspaceShell title="Move-Out Notice">
      {/* Warning banner */}
      <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-[#F8FAFC]">Before you proceed</p>
              <p className="text-[#94A3B8] mt-1">
                Submitting a move-out notice is a formal action. Your property manager will be
                notified immediately. A notice period of{' '}
                <strong className="text-[#F8FAFC]">{lease.noticePeriodDays} days</strong> is
                required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease context */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#94A3B8]" />
            <CardTitle>Current Lease</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#94A3B8]">Lease end</p>
              <p className="font-semibold text-[#F8FAFC]">{formatDate(leaseEndDate)}</p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Days remaining</p>
              <p
                className={`font-semibold ${
                  daysToEnd <= 30 ? 'text-[#F59E0B]' : 'text-[#F8FAFC]'
                }`}
              >
                {daysToEnd > 0 ? `${daysToEnd} days` : 'Expired'}
              </p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Notice period</p>
              <p className="font-semibold text-[#F8FAFC]">{lease.noticePeriodDays} days</p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Earliest move-out</p>
              <p className="font-semibold text-[#F8FAFC]">{formatDate(minDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notice form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut size={16} className="text-[#94A3B8]" />
            <CardTitle>Submit Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">
                Intended move-out date <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="date"
                value={moveOutDate}
                min={minDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors focus:border-[#3B82F6] [color-scheme:dark]"
              />
              <p className="mt-1 text-xs text-[#475569]">
                Must be at least {lease.noticePeriodDays} days from today.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. Relocating for work, purchasing a home…"
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#3B82F6] resize-none"
              />
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#1E3350] bg-[#0F1B31] accent-[#3B82F6]"
              />
              <span className="text-sm text-[#94A3B8]">
                I understand this notice is formal and will be sent to my property manager. I
                confirm my intended move-out date is{' '}
                <strong className="text-[#F8FAFC]">
                  {moveOutDate ? formatDate(moveOutDate) : '—'}
                </strong>
                .
              </span>
            </label>

            {mutation.isError && (
              <p className="text-xs text-[#F43F5E]">
                Failed to submit notice. Please try again or contact your property manager.
              </p>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => mutation.mutate()}
                disabled={!canSubmit || mutation.isPending}
                variant="destructive"
              >
                {mutation.isPending ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <LogOut size={13} />
                )}
                Submit Move-Out Notice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
