'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchInspections, type Inspection } from '@/lib/tenant-api';
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
    case 'SCHEDULED':  return <Badge variant="info">Scheduled</Badge>;
    case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
    case 'COMPLETED':  return <Badge variant="success">Completed</Badge>;
    case 'CANCELLED':  return <Badge variant="muted">Cancelled</Badge>;
    default:           return <Badge variant="muted">{status}</Badge>;
  }
}

export default function InspectionsPage() {
  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: fetchInspections,
  });

  const upcoming = inspections.filter((i) =>
    ['SCHEDULED', 'IN_PROGRESS'].includes(i.status.toUpperCase()),
  );
  const past = inspections.filter(
    (i) => !['SCHEDULED', 'IN_PROGRESS'].includes(i.status.toUpperCase()),
  );

  return (
    <WorkspaceShell title="Inspections">
      {isLoading ? (
        <Card>
          <CardContent className="pt-5">
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : inspections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList size={32} className="mx-auto mb-3 text-[#94A3B8]" />
            <p className="text-sm text-[#94A3B8]">No inspections on record.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-[#94A3B8]" />
                  <CardTitle>Upcoming</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <InspectionList items={upcoming} />
              </CardContent>
            </Card>
          )}
          {past.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-[#94A3B8]" />
                  <CardTitle>Past Inspections</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <InspectionList items={past} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </WorkspaceShell>
  );
}

function InspectionList({ items }: { items: Inspection[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((insp) => (
        <Link
          key={insp.id}
          href={`/inspections/${insp.id}`}
          className="flex items-center justify-between gap-4 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-4 py-3 transition-colors hover:border-[#2B4A73]"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#F8FAFC]">
              {TYPE_LABELS[insp.type?.toUpperCase()] ?? insp.type ?? 'Inspection'}
            </p>
            <p className="text-xs text-[#94A3B8]">{formatDate(insp.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {statusBadge(insp.status)}
            <ChevronRight size={14} className="text-[#475569]" />
          </div>
        </Link>
      ))}
    </div>
  );
}
