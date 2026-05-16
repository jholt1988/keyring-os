'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, TrendingUp, Home, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { WorkspaceShell, RiskMeter, ExplainableAction, SectionCard, MetricCard } from '@/components/copilot';
import { useRenewalsWorkspace } from '@/app/hooks/useWorkspace';
import { createRenewalOffer } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';
import type { Severity } from '@keyring/types';

export default function RenewalsPage() {
  const { data, isLoading, refetch } = useRenewalsWorkspace();
  const qc = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  const [offerTarget, setOfferTarget] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({ proposedRent: '', proposedStart: '', proposedEnd: '', expiresAt: '', message: '' });

  const invalidate = () => { qc.invalidateQueries({ queryKey: ['workspace', 'renewals'] }); refetch(); };

  const sendOfferMutation = useMutation({
    mutationFn: () => createRenewalOffer(offerTarget.leaseId, {
      proposedRent: parseFloat(offerForm.proposedRent),
      proposedStart: offerForm.proposedStart,
      proposedEnd: offerForm.proposedEnd,
      expiresAt: offerForm.expiresAt || undefined,
      message: offerForm.message || undefined,
    }),
    onSuccess: () => { toast('Renewal offer sent'); setOfferTarget(null); invalidate(); },
    onError: () => toast('Failed to send offer', 'error'),
  });

  const openOfferModal = (lease: any, rec: any) => {
    const endDate = lease.endDate ? new Date(lease.endDate) : new Date();
    const start = new Date(endDate); start.setDate(start.getDate() + 1);
    const end = new Date(start); end.setFullYear(end.getFullYear() + 1);
    const expires = new Date(); expires.setDate(expires.getDate() + 30);
    setOfferForm({
      proposedRent: String(rec?.recommendedRent ?? lease.rentAmount ?? ''),
      proposedStart: start.toISOString().split('T')[0],
      proposedEnd: end.toISOString().split('T')[0],
      expiresAt: expires.toISOString().split('T')[0],
      message: '',
    });
    setOfferTarget(lease);
  };

  if (isLoading) {
    return (
      <WorkspaceShell title="Renewals" subtitle="Revenue Continuity Engine" icon={RefreshCw}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}
        </div>
      </WorkspaceShell>
    );
  }

  const leases: any[] = (data?.leases as any)?.data ?? data?.leases ?? [];
  const recommendations: any[] = (data?.recommendations as any)?.data ?? data?.recommendations ?? [];

  const now = new Date();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const activeLeases = (Array.isArray(leases) ? leases : []).filter((l) => l.status === 'ACTIVE');
  const expiringLeases = activeLeases
    .filter((l) => { if (!l.endDate) return false; const end = new Date(l.endDate); return end <= ninetyDays && end >= now; })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  const totalMonthlyAtRisk = expiringLeases.reduce((s, l) => s + (l.rentAmount ?? 0), 0);
  const renewalOffersSent = activeLeases.filter((l) => l.renewalOffers?.some((o: any) => o.status === 'OFFERED')).length;
  const renewalsAccepted = activeLeases.filter((l) => l.renewalOffers?.some((o: any) => o.status === 'ACCEPTED')).length;

  const daysUntilExpiry = (endDate: string) => Math.max(0, Math.ceil((new Date(endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <>
    <WorkspaceShell title="Renewals" subtitle="Revenue Continuity Engine" icon={RefreshCw}>
      <div className="glass-panel rounded-[30px] p-6 mb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7FA7D9]">Revenue Continuity</p>
            <h2 className="mt-2 font-[family-name:var(--font-space)] text-3xl font-semibold tracking-tight text-[#F8FAFC]">
              AI-driven retention.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8DA4C5]">
              Monitor expiring leases and send dynamically priced renewal offers to maximize revenue and minimize vacancy periods.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Expiring ≤90d', value: String(expiringLeases.length), tone: 'text-[#FBBF24]' },
              { label: 'Monthly at Risk', value: `$${totalMonthlyAtRisk.toLocaleString()}`, tone: 'text-[#F87171]' },
              { label: 'Offers Sent', value: String(renewalOffersSent), tone: 'text-[#60A5FA]' },
              { label: 'Accepted', value: String(renewalsAccepted), tone: 'text-[#10B981]' },
            ].map((item) => (
              <div key={item.label} className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#6E85A5]">{item.label}</div>
                <div className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Expiring Leases" subtitle="Sorted by urgency" className="lg:col-span-2">
          {expiringLeases.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-[#10B981]"><CheckCircle size={14} /> No leases expiring within 90 days</p>
          ) : (
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {expiringLeases.map((lease) => {
                const days = daysUntilExpiry(lease.endDate);
                const severity: Severity = days <= 14 ? 'critical' : days <= 30 ? 'high' : days <= 60 ? 'medium' : 'low';
                const rec = (Array.isArray(recommendations) ? recommendations : []).find((r) => r.unitId === lease.unitId);
                const offerStatus = lease.renewalOffers?.find((o: any) => o.status === 'OFFERED' || o.status === 'ACCEPTED');

                return (
                  <div key={lease.id} className="rounded-[18px] border border-[#1E3350] bg-[#0F1B31] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">{lease.tenant?.username ?? 'Tenant'}</p>
                        <p className="text-xs text-[#94A3B8]">{lease.unit?.property?.name ?? ''} - {lease.unit?.name ?? ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm ${days <= 14 ? 'text-[#F43F5E]' : days <= 30 ? 'text-[#F59E0B]' : 'text-[#F8FAFC]'}`}>{days} days</p>
                        <p className="text-[10px] text-[#94A3B8]">${(lease.rentAmount ?? 0).toLocaleString()}/mo</p>
                      </div>
                    </div>
                    <RiskMeter level={severity} className="mb-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rec && <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 font-mono text-[10px] text-[#3B82F6]">AI: ${rec.recommendedRent?.toLocaleString()}/mo suggested</span>}
                        {offerStatus && <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${offerStatus.status === 'ACCEPTED' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>{offerStatus.status}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!offerStatus && (
                          <Button size="sm" onClick={() => openOfferModal(lease, rec)}>
                            <Send size={12} /> Send Offer
                          </Button>
                        )}
                        <Button size="sm" variant="outline"
                          onClick={() => router.push(`/properties/${lease.unit?.propertyId}/units/${lease.unitId}`)}
                        >
                          <Home size={12} /> Prep Listing
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Pricing Intelligence" subtitle="AI rent recommendations">
          {(Array.isArray(recommendations) ? recommendations : []).length === 0 ? (
            <p className="text-sm text-[#94A3B8]">No rent recommendations available.</p>
          ) : (
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {(Array.isArray(recommendations) ? recommendations : []).slice(0, 6).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between rounded-[10px] bg-[#0F1B31] p-3">
                  <div>
                    <p className="text-xs font-medium text-[#F8FAFC]">Unit {rec.unitId?.slice(-6) ?? rec.unit?.name ?? ''}</p>
                    <p className="text-[10px] text-[#94A3B8]">Current: ${(rec.currentRent ?? 0).toLocaleString()} | Suggested: ${(rec.recommendedRent ?? 0).toLocaleString()}</p>
                  </div>
                  {(rec.recommendedRent ?? 0) > (rec.currentRent ?? 0) ? (
                    <span className="flex items-center gap-1 font-mono text-xs text-[#10B981]"><TrendingUp size={12} /> +${((rec.recommendedRent ?? 0) - (rec.currentRent ?? 0)).toLocaleString()}</span>
                  ) : (
                    <span className="font-mono text-xs text-[#94A3B8]">No change</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Renewal Strategy" subtitle="Automated workflow">
          <ExplainableAction
            trigger="Leases approaching 90-day expiration window"
            reasoning="System evaluates churn risk, market comparables, and tenant payment history to determine optimal renewal pricing"
            recommendation="AI generates offers nightly. Review and send before the 60-day mark for maximum retention."
          />
          <div className="mt-4 space-y-2 border-t border-[#1E3350] pt-3">
            <p className="flex items-center gap-2 text-xs text-[#94A3B8]"><CheckCircle size={12} className="text-[#10B981]" /> Daily expiration monitoring (90/60/30/14/7 days)</p>
            <p className="flex items-center gap-2 text-xs text-[#94A3B8]"><CheckCircle size={12} className="text-[#10B981]" /> AI pricing with churn risk analysis</p>
            <p className="flex items-center gap-2 text-xs text-[#94A3B8]"><CheckCircle size={12} className="text-[#10B981]" /> Auto-renewal support with escalation %</p>
            <p className="flex items-center gap-2 text-xs text-[#94A3B8]"><AlertTriangle size={12} className="text-[#F59E0B]" /> Fallback to listing pipeline if declined</p>
          </div>
        </SectionCard>
      </div>
    </WorkspaceShell>

      {/* Send Offer modal */}
      <Modal open={!!offerTarget} onClose={() => setOfferTarget(null)} title="Send Renewal Offer" size="md"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setOfferTarget(null)}>Cancel</Button>
          <Button size="sm"
            onClick={() => sendOfferMutation.mutate()}
            disabled={!offerForm.proposedRent || !offerForm.proposedStart || !offerForm.proposedEnd || sendOfferMutation.isPending}
          >
            {sendOfferMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />} Send Offer
          </Button>
        </>}
      >
        <div className="space-y-3">
          {[
            { label: 'Proposed rent ($/mo) *', key: 'proposedRent', type: 'number' },
            { label: 'Start date *', key: 'proposedStart', type: 'date' },
            { label: 'End date *', key: 'proposedEnd', type: 'date' },
            { label: 'Offer expires', key: 'expiresAt', type: 'date' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-[#94A3B8]">{label}</label>
              <input type={type} value={(offerForm as any)[key]}
                onChange={(e) => setOfferForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6] [color-scheme:dark]" />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Message (optional)</label>
            <textarea value={offerForm.message} onChange={(e) => setOfferForm((p) => ({ ...p, message: e.target.value }))} rows={2}
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        </div>
      </Modal>
    </>
  );
}
