'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Home, Plus, RefreshCw, TrendingDown } from 'lucide-react';
import { WorkspaceShell, RiskMeter, SectionCard, MetricCard } from '@/components/copilot';
import { useLeasingWorkspace } from '@/app/hooks/useWorkspace';
import { ToursSection } from '@/components/parity/shared';
import { fetchLeadApplications, submitLeadApplication, triggerApplicationScreening, triggerSyndication, updateLeadApplicationStatus } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';

const PIPELINE_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'TOURING', 'APPLICATION_SUBMITTED', 'CONVERTED'];

export default function LeasingPage() {
  const { data, isLoading } = useLeasingWorkspace();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'tours' | 'applications'>('pipeline');
  const [appOpen, setAppOpen] = useState(false);
  const [appForm, setAppForm] = useState({ leadId: '', propertyId: '', status: 'NEW' });


  const stats = (data?.stats as any) ?? {};
  const leads = (data?.leads as any)?.leads ?? data?.leads ?? [];
  const opsSummary = (data?.opsSummary as any) ?? {};

  const vacantUnits = opsSummary.vacantUnits ?? stats.vacantUnits ?? 0;
  const avgRent = opsSummary.avgRent ?? 1500;
  const revenueLeak = vacantUnits * avgRent;
  const propertyIdForSyndication = opsSummary.primaryPropertyId ?? leads[0]?.propertyId ?? '';

  const applicationsQuery = useQuery({
    queryKey: ['parity', 'lead-applications'],
    queryFn: () => fetchLeadApplications(),
  });
  const applications = Array.isArray(applicationsQuery.data) ? applicationsQuery.data : [];

  const syndicationMutation = useMutation({
    mutationFn: () => triggerSyndication(propertyIdForSyndication),
    onSuccess: () => toast('Listing syndication triggered'),
    onError: () => toast('Failed to trigger syndication', 'error'),
  });
  const createAppMutation = useMutation({
    mutationFn: () => submitLeadApplication(appForm),
    onSuccess: () => {
      toast('Application submitted');
      setAppOpen(false);
      setAppForm({ leadId: '', propertyId: '', status: 'NEW' });
      qc.invalidateQueries({ queryKey: ['parity', 'lead-applications'] });
    },
    onError: () => toast('Failed to submit application', 'error'),
  });
  const updateAppMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLeadApplicationStatus(id, status),
    onSuccess: () => {
      toast('Application status updated');
      qc.invalidateQueries({ queryKey: ['parity', 'lead-applications'] });
    },
    onError: () => toast('Failed to update application', 'error'),
  });
  const screeningMutation = useMutation({
    mutationFn: (id: string) => triggerApplicationScreening(id),
    onSuccess: () => {
      toast('Screening triggered');
      qc.invalidateQueries({ queryKey: ['parity', 'lead-applications'] });
    },
    onError: () => toast('Failed to trigger screening', 'error'),
  });

  const pipelineCounts: Record<string, any[]> = {};
  PIPELINE_STAGES.forEach((s) => { pipelineCounts[s] = []; });
  (Array.isArray(leads) ? leads : []).forEach((lead: any) => {
    const status = (lead.status ?? 'NEW').toUpperCase();
    (pipelineCounts[status] ?? pipelineCounts.NEW).push(lead);
  });

  if (isLoading) {
    return (
      <WorkspaceShell title="Leasing" subtitle="Revenue Pipeline Engine" icon={Home}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Leasing" subtitle="Revenue Pipeline Engine" icon={Home}>
      <div className="flex flex-wrap gap-2 rounded-[18px] border border-[#1E3350] bg-[#0F1B31] p-1">
        {[
          ['pipeline', 'Pipeline'],
          ['tours', 'Tours'],
          ['applications', 'Applications'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`rounded-[14px] px-3 py-2 text-xs font-medium ${activeTab === id ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'pipeline' && (
      <>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={vacantUnits} label="Vacant Units" variant="danger" />
        <MetricCard value={`$${revenueLeak.toLocaleString()}`} label="Monthly Revenue Leak" variant="danger" />
        <MetricCard value={(Array.isArray(leads) ? leads : []).length} label="Active Leads" variant="info" />
        <MetricCard value={stats.expiringLeases ?? opsSummary.expiringLeases ?? 0} label="Expiring Soon" variant="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Leasing Pipeline" subtitle="Lead to lease progression" className="lg:col-span-2">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage} className="min-w-[160px] shrink-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">{stage.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-xs text-[#F8FAFC]">{pipelineCounts[stage]?.length ?? 0}</span>
                </div>
                <div className="space-y-2">
                  {(pipelineCounts[stage] ?? []).slice(0, 5).map((lead: any) => (
                    <div key={lead.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-2.5 transition-all duration-[180ms] hover:bg-[#17304E]">
                      <p className="truncate text-xs font-medium text-[#F8FAFC]">{lead.name ?? 'Lead'}</p>
                      <p className="truncate text-[10px] text-[#94A3B8]">{lead.email ?? ''}</p>
                      {lead.budget && <p className="mt-1 font-mono text-[10px] text-[#3B82F6]">${lead.budget}/mo</p>}
                    </div>
                  ))}
                  {(pipelineCounts[stage]?.length ?? 0) === 0 && (
                    <div className="rounded-[14px] border border-dashed border-[#1E3350] p-3 text-center text-xs text-[#94A3B8]">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Revenue Leak" subtitle="Cost of vacant units">
          {vacantUnits === 0 ? (
            <p className="text-sm text-[#10B981]">No vacancies. Full occupancy.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#F43F5E]">
                <TrendingDown size={18} />
                <span className="font-[family-name:var(--font-space)] text-lg font-bold">${revenueLeak.toLocaleString()}/month lost</span>
              </div>
              <p className="text-xs text-[#94A3B8]">{vacantUnits} vacant unit{vacantUnits > 1 ? 's' : ''} at avg ${avgRent.toLocaleString()}/mo</p>
              <RiskMeter level={vacantUnits > 5 ? 'critical' : vacantUnits > 2 ? 'high' : 'medium'} />
              <div className="border-t border-[#1E3350] pt-3">
                <p className="mb-2 font-mono text-[10px] uppercase text-[#94A3B8]">NEXT BEST ACTION</p>
                <p className="text-sm font-medium text-[#F8FAFC]">Activate listing syndication for vacant units</p>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => syndicationMutation.mutate()} disabled={!propertyIdForSyndication || syndicationMutation.isPending}>
                    {syndicationMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <TrendingDown size={12} />} Activate Listing Syndication
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Expiring Leases" subtitle="Within 90 days">
          {(opsSummary.expiringLeaseDetails ?? []).length === 0 ? (
            <p className="text-sm text-[#94A3B8]">No leases expiring within 90 days</p>
          ) : (
            <div className="space-y-2">
              {(opsSummary.expiringLeaseDetails ?? []).slice(0, 6).map((lease: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-[10px] bg-[#0F1B31] p-2.5">
                  <div>
                    <p className="text-xs font-medium text-[#F8FAFC]">{lease.tenantName ?? 'Tenant'}</p>
                    <p className="text-[10px] text-[#94A3B8]">{lease.propertyName ?? ''} - {lease.unitName ?? ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-[#F59E0B]">{lease.daysUntilExpiry ?? '?'} days</p>
                    <p className="text-[10px] text-[#94A3B8]">${(lease.rentAmount ?? 0).toLocaleString()}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
      </>
      )}

      {activeTab === 'tours' && <ToursSection title="Tours Tab" subtitle="Live tour management for leasing" />}

      {activeTab === 'applications' && (
        <>
          <SectionCard
            title="Applications"
            subtitle="Lead applications and screening triggers"
            actions={<Button size="sm" onClick={() => setAppOpen(true)}><Plus size={12} /> Submit Application</Button>}
          >
            {applications.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No applications submitted.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div key={app.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">{app.leadName ?? app.applicantName ?? app.id}</p>
                        <p className="text-xs text-[#94A3B8]">{app.propertyName ?? app.propertyId ?? 'Property'} · {app.status ?? 'NEW'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateAppMutation.mutate({ id: app.id, status: 'APPROVED' })}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => updateAppMutation.mutate({ id: app.id, status: 'DENIED' })}>Deny</Button>
                      <Button size="sm" variant="outline" onClick={() => screeningMutation.mutate(app.id)}>Trigger Screening</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <Modal
            open={appOpen}
            onClose={() => setAppOpen(false)}
            title="Submit Lead Application"
            footer={
              <>
                <Button variant="outline" size="sm" onClick={() => setAppOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={() => createAppMutation.mutate()} disabled={createAppMutation.isPending}>
                  {createAppMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Submit
                </Button>
              </>
            }
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                ['Lead ID', 'leadId'],
                ['Property ID', 'propertyId'],
                ['Status', 'status'],
              ].map(([label, key]) => (
                <label key={key} className="block text-sm text-[#94A3B8]">
                  <span className="mb-1 block">{label}</span>
                  <input value={(appForm as any)[key]} onChange={(e) => setAppForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
                </label>
              ))}
            </div>
          </Modal>
        </>
      )}
    </WorkspaceShell>
  );
}
