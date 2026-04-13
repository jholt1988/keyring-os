'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchRentalApplication } from '@/lib/tenant-api';

export default function RentalApplicationStatusPage() {
  const params = useParams<{ id: string }>();
  const applicationId = typeof params?.id === 'string' ? params.id : '';

  const { data, isLoading } = useQuery({
    queryKey: ['rental-application', applicationId],
    queryFn: () => fetchRentalApplication(applicationId),
    enabled: Boolean(applicationId),
  });

  const status = typeof data === 'object' && data && 'status' in data ? String(data.status) : 'submitted';
  const updatedAt = typeof data === 'object' && data && 'updatedAt' in data ? String(data.updatedAt) : new Date().toISOString();

  return (
    <WorkspaceShell title="Application Status" backHref="/apply" backLabel="Application">
      <Card className="border-[#1E3350] bg-[#13233C]/95">
        <CardHeader>
          <CardTitle>Rental application status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#38BDF8]">Application ID</p>
                <p className="mt-1 text-sm text-[#F8FAFC]">{applicationId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#38BDF8]">Status</p>
                <div className="mt-2">
                  <Badge variant="info">{status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#38BDF8]">Last updated</p>
                <p className="mt-1 text-sm text-[#D7E4F5]">{new Date(updatedAt).toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-[#1E3350] bg-[#0F1B31] p-4 text-sm text-[#D7E4F5]">
                Next expected step: our leasing team will review your submission and contact you if more information is needed.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
