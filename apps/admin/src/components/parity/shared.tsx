'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle, CreditCard, ExternalLink, FileText, Gavel, Plus, RefreshCw, Shield, Sparkles, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SectionCard } from '@/components/copilot/section-card';
import { useToast } from '@/components/ui/toast';
import {
  aiScoreBid,
  assignTour,
  awardBid,
  createBid,
  createManualCharge,
  createPaymentPlan,
  createStripeCheckoutSession,
  fetchAttorneyPacket,
  fetchContractorBids,
  fetchContractorRecommendations,
  fetchLegalTracker,
  fetchPaymentPlans,
  fetchTours,
  recordCourtDate,
  referAttorney,
  rejectBid,
  rescheduleTour,
  resolveLegalHold,
  scheduleTour,
  updateTourStatus,
} from '@/lib/copilot-api';

function getList<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function getLink(value: any) {
  return value?.url ?? value?.checkoutUrl ?? value?.redirectUrl ?? value?.link ?? value?.href ?? null;
}

export function ToursSection({ embeddedLeadId, title = 'Tours', subtitle = 'Schedule and manage property tours' }: {
  embeddedLeadId?: string;
  title?: string;
  subtitle?: string;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<any>(null);
  const [agentId, setAgentId] = useState('');
  const [form, setForm] = useState({ leadId: embeddedLeadId ?? '', propertyId: '', date: '', time: '', agentId: '' });
  const [rescheduleAt, setRescheduleAt] = useState('');

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['parity', 'tours', embeddedLeadId ?? 'all'],
    queryFn: () => fetchTours(embeddedLeadId ? { leadId: embeddedLeadId } : undefined),
  });

  const tours = getList<any>(data);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['parity', 'tours'] });
    refetch();
  };

  const scheduleMutation = useMutation({
    mutationFn: () => scheduleTour(form),
    onSuccess: () => {
      toast('Tour scheduled');
      setScheduleOpen(false);
      setForm({ leadId: embeddedLeadId ?? '', propertyId: '', date: '', time: '', agentId: '' });
      invalidate();
    },
    onError: () => toast('Failed to schedule tour', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTourStatus(id, status),
    onSuccess: () => {
      toast('Tour updated');
      invalidate();
    },
    onError: () => toast('Failed to update tour', 'error'),
  });

  const assignMutation = useMutation({
    mutationFn: () => assignTour(assignTarget.id, agentId),
    onSuccess: () => {
      toast('Tour assigned');
      setAssignTarget(null);
      setAgentId('');
      invalidate();
    },
    onError: () => toast('Failed to assign tour', 'error'),
  });

  const rescheduleMutation = useMutation({
    mutationFn: () => rescheduleTour(rescheduleTarget.id, { scheduledAt: rescheduleAt }),
    onSuccess: () => {
      toast('Tour rescheduled');
      setRescheduleTarget(null);
      setRescheduleAt('');
      invalidate();
    },
    onError: () => toast('Failed to reschedule tour', 'error'),
  });

  return (
    <>
      <SectionCard
        title={title}
        subtitle={subtitle}
        actions={<Button size="sm" onClick={() => setScheduleOpen(true)}><Plus size={12} /> Schedule</Button>}
      >
        {isLoading ? <p className="text-sm text-[#94A3B8]">Loading tours…</p> : tours.length === 0 ? (
          <p className="text-sm text-[#94A3B8]">No tours scheduled</p>
        ) : (
          <div className="space-y-3">
            {tours.map((tour: any) => (
              <div key={tour.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">{tour.leadName ?? tour.prospectName ?? `Tour ${tour.id}`}</p>
                    <p className="text-xs text-[#94A3B8]">{tour.propertyName ?? tour.propertyId ?? 'Property'} · {tour.agentName ?? tour.agentId ?? 'Unassigned'}</p>
                    <p className="mt-1 font-mono text-[10px] text-[#94A3B8]">{tour.scheduledAt ?? `${tour.date ?? ''} ${tour.time ?? ''}`}</p>
                  </div>
                  <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#3B82F6]">
                    {tour.status ?? 'scheduled'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: tour.id, status: 'CONFIRMED' })}>
                    <CheckCircle size={12} /> Confirm
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setAssignTarget(tour)}>
                    <Shield size={12} /> Assign
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRescheduleTarget(tour)}>
                    <Calendar size={12} /> Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Tour"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => scheduleMutation.mutate()} disabled={scheduleMutation.isPending}>
              {scheduleMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Save
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            ['Lead ID', 'leadId'],
            ['Property ID', 'propertyId'],
            ['Date', 'date'],
            ['Time', 'time'],
            ['Agent ID', 'agentId'],
          ].map(([label, key]) => (
            <label key={key} className="block text-sm text-[#94A3B8]">
              <span className="mb-1 block">{label}</span>
              <input
                value={(form as any)[key]}
                onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
              />
            </label>
          ))}
        </div>
      </Modal>

      <Modal
        open={!!assignTarget}
        onClose={() => { setAssignTarget(null); setAgentId(''); }}
        title="Assign Tour"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={() => assignMutation.mutate()} disabled={!agentId || assignMutation.isPending}>
              {assignMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Shield size={12} />} Assign
            </Button>
          </>
        }
      >
        <label className="block text-sm text-[#94A3B8]">
          <span className="mb-1 block">Agent ID</span>
          <input value={agentId} onChange={(e) => setAgentId(e.target.value)} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
        </label>
      </Modal>

      <Modal
        open={!!rescheduleTarget}
        onClose={() => { setRescheduleTarget(null); setRescheduleAt(''); }}
        title="Reschedule Tour"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRescheduleTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={() => rescheduleMutation.mutate()} disabled={!rescheduleAt || rescheduleMutation.isPending}>
              {rescheduleMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Calendar size={12} />} Reschedule
            </Button>
          </>
        }
      >
        <label className="block text-sm text-[#94A3B8]">
          <span className="mb-1 block">Scheduled At</span>
          <input type="datetime-local" value={rescheduleAt} onChange={(e) => setRescheduleAt(e.target.value)} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
        </label>
      </Modal>
    </>
  );
}

export function PaymentOperationsSection({ delinquentItems = [], invoices = [], title = 'Payment Operations' }: {
  delinquentItems?: any[];
  invoices?: any[];
  title?: string;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [trackerLeaseId, setTrackerLeaseId] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [legalDate, setLegalDate] = useState('');
  const [selectedLeaseId, setSelectedLeaseId] = useState('');
  const [planForm, setPlanForm] = useState({ leaseId: '', amount: '', cadence: 'MONTHLY', startDate: '' });
  const [chargeForm, setChargeForm] = useState({ leaseId: '', amount: '', description: '' });

  const plansQuery = useQuery({ queryKey: ['parity', 'payment-plans'], queryFn: fetchPaymentPlans });
  const trackerQuery = useQuery({
    queryKey: ['parity', 'legal-tracker', trackerLeaseId],
    queryFn: () => fetchLegalTracker(trackerLeaseId!),
    enabled: !!trackerLeaseId,
  });
  const attorneyPacketQuery = useQuery({
    queryKey: ['parity', 'attorney-packet', trackerLeaseId],
    queryFn: () => fetchAttorneyPacket(trackerLeaseId!),
    enabled: !!trackerLeaseId,
  });

  const paymentPlans = getList<any>(plansQuery.data);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['workspace', 'payments'] });
    qc.invalidateQueries({ queryKey: ['parity', 'payment-plans'] });
  };

  const referMutation = useMutation({
    mutationFn: (leaseId: string) => referAttorney({ leaseId }),
    onSuccess: () => { toast('Attorney referral sent'); invalidate(); },
    onError: () => toast('Failed to refer attorney', 'error'),
  });

  const resolveMutation = useMutation({
    mutationFn: (leaseId: string) => resolveLegalHold({ leaseId }),
    onSuccess: () => { toast('Legal hold resolved'); invalidate(); },
    onError: () => toast('Failed to resolve legal hold', 'error'),
  });

  const courtDateMutation = useMutation({
    mutationFn: () => recordCourtDate({ leaseId: selectedLeaseId, courtDate: legalDate }),
    onSuccess: () => { toast('Court date recorded'); setSelectedLeaseId(''); setLegalDate(''); invalidate(); },
    onError: () => toast('Failed to record court date', 'error'),
  });

  const planMutation = useMutation({
    mutationFn: () => createPaymentPlan({ ...planForm, amount: Number(planForm.amount) || 0 }),
    onSuccess: () => {
      toast('Payment plan created');
      setPlanOpen(false);
      setPlanForm({ leaseId: '', amount: '', cadence: 'MONTHLY', startDate: '' });
      invalidate();
    },
    onError: () => toast('Failed to create payment plan', 'error'),
  });

  const manualChargeMutation = useMutation({
    mutationFn: () => createManualCharge({ ...chargeForm, amount: Number(chargeForm.amount) || 0 }),
    onSuccess: () => {
      toast('Manual charge created');
      setChargeOpen(false);
      setChargeForm({ leaseId: '', amount: '', description: '' });
      invalidate();
    },
    onError: () => toast('Failed to create manual charge', 'error'),
  });

  const checkoutMutation = useMutation({
    mutationFn: (invoice: any) => createStripeCheckoutSession({ invoiceId: invoice.id, leaseId: invoice.leaseId, amount: invoice.amount ?? invoice.balance }),
    onSuccess: (result) => {
      const link = getLink(result);
      if (link && typeof window !== 'undefined') window.open(link, '_blank', 'noopener,noreferrer');
      toast(link ? 'Stripe checkout opened' : 'Checkout session created');
    },
    onError: () => toast('Failed to create checkout session', 'error'),
  });

  return (
    <>
      <SectionCard
        title={title}
        subtitle="Legal workflow, payment plans, manual charges, and invoice actions"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPlanOpen(true)}><Plus size={12} /> Payment Plan</Button>
            <Button size="sm" onClick={() => setChargeOpen(true)}><CreditCard size={12} /> Manual Charge</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {(delinquentItems.length ? delinquentItems : []).slice(0, 6).map((item: any) => (
              <div key={item.id ?? item.leaseId} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">{item.tenantName ?? 'Tenant'}</p>
                    <p className="text-xs text-[#94A3B8]">Lease {item.leaseId ?? item.id} · {item.noticeStatus ?? 'No legal status'}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setTrackerLeaseId(String(item.leaseId ?? item.id))}><FileText size={12} /> Tracker</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => referMutation.mutate(String(item.leaseId ?? item.id))}><Gavel size={12} /> Refer</Button>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedLeaseId(String(item.leaseId ?? item.id)); setLegalDate(''); }}><Calendar size={12} /> Court Date</Button>
                  <Button size="sm" variant="outline" onClick={() => resolveMutation.mutate(String(item.leaseId ?? item.id))}><CheckCircle size={12} /> Resolve Hold</Button>
                </div>
              </div>
            ))}
            {delinquentItems.length === 0 && <p className="text-sm text-[#94A3B8]">No delinquent items available.</p>}
          </div>
          <div className="space-y-3">
            <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-[#94A3B8]">Payment Plans</p>
              {paymentPlans.length === 0 ? <p className="text-sm text-[#94A3B8]">No plans created</p> : paymentPlans.slice(0, 5).map((plan: any) => (
                <div key={plan.id} className="mb-2 rounded-[10px] bg-[#13233C] p-2 last:mb-0">
                  <p className="text-xs text-[#F8FAFC]">{plan.leaseId ?? 'Lease'} · {plan.status ?? 'Active'}</p>
                  <p className="font-mono text-[10px] text-[#94A3B8]">{plan.cadence ?? 'Monthly'} · ${plan.amount ?? plan.paymentAmount ?? 0}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-[#94A3B8]">Invoices</p>
              {invoices.length === 0 ? <p className="text-sm text-[#94A3B8]">No invoices available</p> : invoices.slice(0, 5).map((invoice: any) => (
                <div key={invoice.id} className="mb-2 flex items-center justify-between rounded-[10px] bg-[#13233C] p-2 last:mb-0">
                  <div>
                    <p className="text-xs text-[#F8FAFC]">{invoice.tenantName ?? invoice.description ?? `Invoice ${invoice.id}`}</p>
                    <p className="font-mono text-[10px] text-[#94A3B8]">${invoice.amount ?? invoice.balance ?? 0}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => checkoutMutation.mutate(invoice)}>
                    <ExternalLink size={12} /> Pay Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <Modal open={!!trackerLeaseId} onClose={() => setTrackerLeaseId(null)} title="Legal Tracker">
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-[#94A3B8]">Tracker</p>
            <pre className="overflow-x-auto text-xs text-[#CBD5E1]">{JSON.stringify(trackerQuery.data ?? {}, null, 2)}</pre>
          </div>
          <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-[#94A3B8]">Attorney Packet</p>
            <pre className="overflow-x-auto text-xs text-[#CBD5E1]">{JSON.stringify(attorneyPacketQuery.data ?? {}, null, 2)}</pre>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!selectedLeaseId}
        onClose={() => { setSelectedLeaseId(''); setLegalDate(''); }}
        title="Record Court Date"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelectedLeaseId('')}>Cancel</Button>
            <Button size="sm" onClick={() => courtDateMutation.mutate()} disabled={!legalDate || courtDateMutation.isPending}>
              {courtDateMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Calendar size={12} />} Save
            </Button>
          </>
        }
      >
        <label className="block text-sm text-[#94A3B8]">
          <span className="mb-1 block">Court Date</span>
          <input type="date" value={legalDate} onChange={(e) => setLegalDate(e.target.value)} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
        </label>
      </Modal>

      <Modal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        title="Create Payment Plan"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPlanOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => planMutation.mutate()} disabled={planMutation.isPending}>
              {planMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Create
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            ['Lease ID', 'leaseId'],
            ['Amount', 'amount'],
            ['Cadence', 'cadence'],
            ['Start Date', 'startDate'],
          ].map(([label, key]) => (
            <label key={key} className="block text-sm text-[#94A3B8]">
              <span className="mb-1 block">{label}</span>
              <input value={(planForm as any)[key]} onChange={(e) => setPlanForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
            </label>
          ))}
        </div>
      </Modal>

      <Modal
        open={chargeOpen}
        onClose={() => setChargeOpen(false)}
        title="Create Manual Charge"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setChargeOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => manualChargeMutation.mutate()} disabled={manualChargeMutation.isPending}>
              {manualChargeMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <CreditCard size={12} />} Create
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          {[
            ['Lease ID', 'leaseId'],
            ['Amount', 'amount'],
            ['Description', 'description'],
          ].map(([label, key]) => (
            <label key={key} className="block text-sm text-[#94A3B8]">
              <span className="mb-1 block">{label}</span>
              <input value={(chargeForm as any)[key]} onChange={(e) => setChargeForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
            </label>
          ))}
        </div>
      </Modal>
    </>
  );
}

export function ContractorBidsSection({ propertyId, requestId, title = 'Contractor Bids' }: {
  propertyId?: string;
  requestId?: string;
  title?: string;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ requestId: requestId ?? '', propertyId: propertyId ?? '', vendorId: '', amount: '', scope: '' });

  const bidsQuery = useQuery({
    queryKey: ['parity', 'contractor-bids', propertyId ?? 'all', requestId ?? 'all'],
    queryFn: () => fetchContractorBids({ ...(propertyId ? { propertyId } : {}), ...(requestId ? { requestId } : {}) }),
  });
  const recommendationsQuery = useQuery({
    queryKey: ['parity', 'contractor-recommendations', propertyId],
    queryFn: () => fetchContractorRecommendations(propertyId!),
    enabled: !!propertyId,
  });

  const bids = getList<any>(bidsQuery.data);
  const recommendations = getList<any>(recommendationsQuery.data);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['workspace', 'repairs'] });
    qc.invalidateQueries({ queryKey: ['parity', 'contractor-bids'] });
  };

  const createMutation = useMutation({
    mutationFn: () => createBid({ ...form, amount: Number(form.amount) || 0 }),
    onSuccess: () => {
      toast('Bid created');
      setCreateOpen(false);
      setForm({ requestId: requestId ?? '', propertyId: propertyId ?? '', vendorId: '', amount: '', scope: '' });
      invalidate();
    },
    onError: () => toast('Failed to create bid', 'error'),
  });
  const awardMutation = useMutation({ mutationFn: (id: string) => awardBid(id), onSuccess: () => { toast('Bid awarded'); invalidate(); }, onError: () => toast('Failed to award bid', 'error') });
  const rejectMutation = useMutation({ mutationFn: (id: string) => rejectBid(id), onSuccess: () => { toast('Bid rejected'); invalidate(); }, onError: () => toast('Failed to reject bid', 'error') });
  const aiMutation = useMutation({ mutationFn: (id: string) => aiScoreBid(id), onSuccess: () => { toast('AI score requested'); invalidate(); }, onError: () => toast('Failed to score bid', 'error') });

  return (
    <>
      <SectionCard
        title={title}
        subtitle="Vendor bidding, awards, and AI scoring"
        actions={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={12} /> Create Bid</Button>}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {bids.length === 0 ? <p className="text-sm text-[#94A3B8]">No bids found</p> : bids.map((bid: any) => (
              <div key={bid.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">{bid.vendorName ?? bid.vendorId ?? `Bid ${bid.id}`}</p>
                    <p className="text-xs text-[#94A3B8]">{bid.scope ?? bid.requestTitle ?? 'Scope pending'}</p>
                    <p className="mt-1 font-mono text-[10px] text-[#94A3B8]">${bid.amount ?? bid.total ?? 0} · {bid.status ?? 'PENDING'}</p>
                  </div>
                  <span className="rounded-full bg-[#F59E0B]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#F59E0B]">{bid.status ?? 'PENDING'}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => awardMutation.mutate(bid.id)}><CheckCircle size={12} /> Award</Button>
                  <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(bid.id)}><XCircle size={12} /> Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => aiMutation.mutate(bid.id)}><Sparkles size={12} /> AI Score</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-[#94A3B8]">Recommendations</p>
            {recommendations.length === 0 ? <p className="text-sm text-[#94A3B8]">No contractor recommendations</p> : recommendations.slice(0, 5).map((rec: any, index: number) => (
              <div key={rec.id ?? index} className="mb-2 rounded-[10px] bg-[#13233C] p-2 last:mb-0">
                <p className="text-xs text-[#F8FAFC]">{rec.name ?? rec.vendorName ?? 'Recommended Vendor'}</p>
                <p className="font-mono text-[10px] text-[#94A3B8]">{rec.specialty ?? rec.score ?? 'General'}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Contractor Bid"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Create
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            ['Request ID', 'requestId'],
            ['Property ID', 'propertyId'],
            ['Vendor ID', 'vendorId'],
            ['Amount', 'amount'],
            ['Scope', 'scope'],
          ].map(([label, key]) => (
            <label key={key} className="block text-sm text-[#94A3B8]">
              <span className="mb-1 block">{label}</span>
              <input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
            </label>
          ))}
        </div>
      </Modal>
    </>
  );
}

export function SimpleKeyValueGrid({ data }: { data: Record<string, any> | null | undefined }) {
  const entries = useMemo(() => Object.entries(data ?? {}).filter(([, value]) => typeof value !== 'object'), [data]);
  if (entries.length === 0) return <p className="text-sm text-[#94A3B8]">No summary data available.</p>;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
          <p className="mt-1 text-sm font-semibold text-[#F8FAFC]">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}

export function SimpleDataTable({ rows }: { rows: any[] }) {
  if (!rows.length) return <p className="text-sm text-[#94A3B8]">No rows available.</p>;
  const cols = Object.keys(rows[0]).filter((key) => typeof rows[0][key] !== 'object');
  return (
    <div className="overflow-x-auto rounded-[14px] border border-[#1E3350]">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1E3350] bg-[#0F1B31]">
            {cols.map((col) => <th key={col} className="px-3 py-2 text-left font-medium text-[#94A3B8]">{col.replace(/([A-Z])/g, ' $1').trim()}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, index) => (
            <tr key={index} className="border-b border-[#1E3350] last:border-0">
              {cols.map((col) => <td key={col} className="px-3 py-2 text-[#CBD5E1]">{String(row[col] ?? '—')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
