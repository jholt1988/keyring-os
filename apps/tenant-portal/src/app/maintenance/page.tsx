'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Wrench, Plus, ArrowRight } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMaintenanceRequests } from '@/lib/tenant-api';
import { formatDate } from '@/lib/utils';

function statusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':     return <Badge variant="warning">Open</Badge>;
    case 'IN_PROGRESS': return <Badge variant="info">In Progress</Badge>;
    case 'COMPLETED':   return <Badge variant="success">Completed</Badge>;
    case 'CLOSED':      return <Badge variant="muted">Closed</Badge>;
    default:            return <Badge variant="muted">{status}</Badge>;
  }
}

function priorityBadge(priority: string) {
  switch (priority.toUpperCase()) {
    case 'EMERGENCY': return <Badge variant="destructive">Emergency</Badge>;
    case 'HIGH':      return <Badge variant="warning">High</Badge>;
    case 'MEDIUM':    return <Badge variant="info">Medium</Badge>;
    default:          return <Badge variant="muted">Normal</Badge>;
  }
}

export default function MaintenancePage() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenanceRequests,
  });

  const open = requests.filter((r) => !['COMPLETED', 'CLOSED'].includes(r.status.toUpperCase()));
  const resolved = requests.filter((r) => ['COMPLETED', 'CLOSED'].includes(r.status.toUpperCase()));

  return (
    <WorkspaceShell
      title="Maintenance"
      backHref="/feed"
      backLabel="Feed"
      actions={
        <Link
          href="/maintenance/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
        >
          <Plus size={14} />
          New Request
        </Link>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-[14px]" />)}
        </div>
      ) : (
        <>
          {/* Open requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-[#14B8A6]" />
                <CardTitle>Open Requests ({open.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {open.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#94A3B8]">No open requests.</p>
              ) : (
                <div className="flex flex-col divide-y divide-[#1E3350]">
                  {open.map((req) => (
                    <Link
                      key={req.id}
                      href={`/maintenance/${req.id}`}
                      className="flex items-center justify-between py-3 transition-colors hover:bg-[#17304E]/20 -mx-5 px-5 rounded"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-[#F8FAFC]">{req.title}</p>
                        <div className="flex items-center gap-2">
                          {statusBadge(req.status)}
                          {priorityBadge(req.priority)}
                          <span className="text-xs text-[#94A3B8]">{formatDate(req.createdAt)}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-[#94A3B8]" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolved */}
          {resolved.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#94A3B8]">Resolved ({resolved.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col divide-y divide-[#1E3350]">
                  {resolved.map((req) => (
                    <Link
                      key={req.id}
                      href={`/maintenance/${req.id}`}
                      className="flex items-center justify-between py-3 opacity-60 transition-all hover:opacity-100 -mx-5 px-5 rounded"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-[#F8FAFC]">{req.title}</p>
                        <div className="flex items-center gap-2">
                          {statusBadge(req.status)}
                          <span className="text-xs text-[#94A3B8]">{formatDate(req.updatedAt)}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-[#94A3B8]" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {requests.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-[14px] border border-[#1E3350] bg-[#13233C] py-16 text-center">
              <Wrench size={32} className="text-[#14B8A6]" />
              <p className="font-semibold text-[#F8FAFC]">No maintenance requests</p>
              <p className="text-sm text-[#94A3B8]">Submit a request when something needs attention.</p>
              <Link
                href="/maintenance/new"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
              >
                <Plus size={14} /> New Request
              </Link>
            </div>
          )}
        </>
      )}
    </WorkspaceShell>
  );
}
