'use client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import LeaseAbstractionView from './lease-abstraction-view';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload } from 'lucide-react';
import { WorkspaceShell, MetricCard, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { bulkExtractOperatorLeases, extractOperatorLease, loadOperatorLeaseAbstractionAnalytics, loadOperatorLeaseAbstractions, reviewOperatorLeaseAbstraction } from '@/lib/operator/read-only-data';
import { useToast } from '@/components/ui/toast';

export default function LeaseAbstractionPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [single, setSingle] = useState<File | null>(null);
  const [bulk, setBulk] = useState<FileList | null>(null);
  const { data: analytics } = useQuery({ queryKey: ['lease-abstraction-analytics'], queryFn: () => loadOperatorLeaseAbstractionAnalytics({}) });
  const { data } = useQuery({ queryKey: ['lease-abstractions'], queryFn: () => loadOperatorLeaseAbstractions({}) });
  const abstractions = Array.isArray(data) ? data : [];
  const refresh = () => qc.invalidateQueries({ queryKey: ['lease-abstractions'] });
  const extractM = useMutation({ mutationFn: async () => { const fd = new FormData(); if (single) fd.append('file', single); return extractOperatorLease(fd as unknown as Record<string, unknown>, {}); }, onSuccess: () => { toast('Lease uploaded for extraction'); refresh(); } });
  const bulkM = useMutation({ mutationFn: async () => { return bulkExtractOperatorLeases({}); }, onSuccess: () => { toast('Bulk extraction started'); refresh(); } });
  const reviewM = useMutation({ mutationFn: (id: string) => reviewOperatorLeaseAbstraction(id, { reviewed: true, approved: true }, {}), onSuccess: () => { toast('Abstraction reviewed'); refresh(); } });

  return (
    <WorkspaceShell title="Lease Abstraction" icon={FileText}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={(analytics as any)?.totalAbstractions ?? 0} label="Abstractions" variant="info" />
        <MetricCard value={(analytics as any)?.reviewedCount ?? 0} label="Reviewed" variant="success" />
        <MetricCard value={(analytics as any)?.pendingCount ?? 0} label="Pending" variant="warning" />
        <MetricCard value={(analytics as any)?.accuracyScore ?? 'n/a'} label="Accuracy" variant="info" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Upload">
          <div className="space-y-3">
            <input type="file" accept=".pdf" onChange={(e) => setSingle(e.target.files?.[0] ?? null)} className="block w-full text-sm text-[#94A3B8]" />
            <Button size="sm" onClick={() => extractM.mutate()} disabled={!single}><Upload size={12} /> Extract Single</Button>
            <input type="file" accept=".pdf" multiple onChange={(e) => setBulk(e.target.files)} className="block w-full text-sm text-[#94A3B8]" />
            <Button size="sm" variant="outline" onClick={() => bulkM.mutate()} disabled={!bulk?.length}><Upload size={12} /> Bulk Extract</Button>
          </div>
        </SectionCard>
        <SectionCard title="Abstractions" className="lg:col-span-2">
          <div className="space-y-3">
            {abstractions.map((item: any) => (
              <div key={item.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                <p className="text-sm font-medium text-[#F8FAFC]">{item.leaseName ?? item.fileName ?? item.id}</p>
                <p className="text-xs text-[#94A3B8]">{item.tenantName ?? 'Tenant'} · Rent {item.rentAmount ?? item.baseRent ?? 'n/a'} · Expiry {item.expiryDate ?? item.endDate ?? 'n/a'}</p>
                <div className="mt-3"><Button size="sm" variant="outline" onClick={() => reviewM.mutate(item.id)}>Review / Approve</Button></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
