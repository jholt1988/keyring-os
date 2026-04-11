'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchInspection, type InspectionRoom } from '@/lib/tenant-api';
import { formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In',
  MOVE_OUT: 'Move-Out',
  ROUTINE: 'Routine',
  ANNUAL: 'Annual',
  DRIVE_BY: 'Drive-By',
};

function statusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'SCHEDULED':   return <Badge variant="info">Scheduled</Badge>;
    case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
    case 'COMPLETED':   return <Badge variant="success">Completed</Badge>;
    case 'CANCELLED':   return <Badge variant="muted">Cancelled</Badge>;
    default:            return <Badge variant="muted">{status}</Badge>;
  }
}

function conditionColor(condition?: string): string {
  switch (condition?.toUpperCase()) {
    case 'GOOD':        return 'text-[#10B981]';
    case 'FAIR':        return 'text-[#F59E0B]';
    case 'POOR':        return 'text-[#F43F5E]';
    case 'DAMAGED':     return 'text-[#F43F5E]';
    default:            return 'text-[#94A3B8]';
  }
}

function RoomCard({ room }: { room: InspectionRoom }) {
  const items = room.checklistItems ?? [];
  const issues = items.filter((i) =>
    ['POOR', 'DAMAGED'].includes(i.condition?.toUpperCase() ?? ''),
  );

  return (
    <div className="rounded-lg border border-[#1E3350] bg-[#0F1B31] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#F8FAFC]">{room.name}</p>
        {issues.length > 0 ? (
          <span className="flex items-center gap-1 text-xs text-[#F43F5E]">
            <AlertCircle size={12} />
            {issues.length} issue{issues.length > 1 ? 's' : ''}
          </span>
        ) : items.length > 0 ? (
          <span className="flex items-center gap-1 text-xs text-[#10B981]">
            <CheckCircle2 size={12} />
            All good
          </span>
        ) : null}
      </div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="text-[#94A3B8]">{item.label}</span>
              <div className="text-right shrink-0">
                {item.condition && (
                  <span className={`font-medium ${conditionColor(item.condition)}`}>
                    {item.condition}
                  </span>
                )}
                {item.notes && (
                  <p className="text-xs text-[#475569] mt-0.5">{item.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#475569]">No checklist items recorded.</p>
      )}
    </div>
  );
}

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => fetchInspection(Number(id)),
  });

  if (isLoading) {
    return (
      <WorkspaceShell title="Inspection" backHref="/inspections" backLabel="Inspections">
        <Skeleton className="h-32 w-full rounded-[14px]" />
        <Skeleton className="h-48 w-full rounded-[14px]" />
      </WorkspaceShell>
    );
  }

  if (!inspection) {
    return (
      <WorkspaceShell title="Inspection" backHref="/inspections" backLabel="Inspections">
        <p className="text-center text-sm text-[#94A3B8]">Inspection not found.</p>
      </WorkspaceShell>
    );
  }

  const rooms = inspection.rooms ?? [];
  const typeLabel =
    TYPE_LABELS[inspection.type?.toUpperCase()] ?? inspection.type ?? 'Inspection';

  return (
    <WorkspaceShell title={typeLabel} backHref="/inspections" backLabel="Inspections">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-[#94A3B8]" />
              <CardTitle>{typeLabel} Inspection</CardTitle>
            </div>
            {statusBadge(inspection.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#94A3B8]">Type</p>
              <p className="font-medium text-[#F8FAFC]">{typeLabel}</p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Status</p>
              <p className="font-medium text-[#F8FAFC]">{inspection.status}</p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Date</p>
              <p className="font-medium text-[#F8FAFC]">{formatDate(inspection.createdAt)}</p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Rooms inspected</p>
              <p className="font-medium text-[#F8FAFC]">{rooms.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room checklist */}
      {rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Room Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {rooms.map((room: InspectionRoom) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </WorkspaceShell>
  );
}
