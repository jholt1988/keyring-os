'use client';

import { useTenantActivity,useTenantWorkspace } from '@/app/hooks/useWorkspace';
import { RiskMeter,SectionCard } from '@/components/copilot';
import { CommunicationTimeline,TenantHealthBadge } from '@/components/tenant';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
addHouseholdMember,addViolation,
createConversation,
createMaintenanceRequest,
logManualPayment,
recordLeaseNotice,
updateTenantProfile,
} from '@/lib/copilot-api';
import { cn } from '@/lib/utils';
import type { Severity } from '@keyring/types';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import {
Activity,
AlertTriangle,
ArrowLeft,
Car,
CheckCircle,
DollarSign,
FileText,
Heart,
MessageSquare,
PawPrint,
RefreshCw,
Send,
Shield,
UserCheck,
Users,
Wrench
} from 'lucide-react';
import Link from 'next/link';
import { useParams,useRouter } from 'next/navigation';
import { useState } from 'react';

const tabs = [
  { key: 'profile', label: 'Profile', icon: UserCheck },
  { key: 'lease', label: 'Lease', icon: FileText },
  { key: 'payments', label: 'Payments', icon: DollarSign },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'communications', label: 'Comms', icon: MessageSquare },
  { key: 'documents', label: 'Docs', icon: FileText },
  { key: 'compliance', label: 'Compliance', icon: Shield },
  { key: 'health', label: 'Health', icon: Heart },
  { key: 'activity', label: 'Activity', icon: Activity },
];

export default function TenantWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const { data: workspace, isLoading, refetch } = useTenantWorkspace(id);
  const { data: activityEvents } = useTenantActivity(id);

  // Modal state
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgSubject, setMsgSubject] = useState('Message from Property Manager');
  const [msgBody, setMsgBody] = useState('');

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeType, setNoticeType] = useState('OTHER');
  const [noticeDelivery, setNoticeDelivery] = useState('EMAIL');
  const [noticeMsg, setNoticeMsg] = useState('');

  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ amountDollars: '', method: 'CASH', reference: '', receivedAt: '', appliedTo: 'RENT', memo: '' });

  const [maintOpen, setMaintOpen] = useState(false);
  const [maintForm, setMaintForm] = useState({ title: '', category: 'OTHER', priority: 'MEDIUM', description: '' });

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Record<string, string>>({});

  // Household member state
  const [householdOpen, setHouseholdOpen] = useState(false);
  const [householdForm, setHouseholdForm] = useState({ name: '', relationship: '', phone: '', isOnLease: false, isEmergency: false });

  // Violation state
  const [violationOpen, setViolationOpen] = useState(false);
  const [violationForm, setViolationForm] = useState({ type: 'LEASE_VIOLATION', date: '', severity: 'MEDIUM', notes: '' });

  const invalidate = () => { qc.invalidateQueries({ queryKey: ['tenant', 'workspace', id] }); refetch(); };

  const messageMutation = useMutation({
    mutationFn: () => createConversation({ subject: msgSubject, content: msgBody }),
    onSuccess: (conv: any) => { toast('Message sent'); setMsgOpen(false); setMsgBody(''); router.push(`/messages/${conv.id}`); },
    onError: () => toast('Failed to send message', 'error'),
  });

  const noticeMutation = useMutation({
    mutationFn: () => {
      const leaseId = workspace?.lease?.id;
      if (!leaseId) throw new Error('No active lease');
      return recordLeaseNotice(leaseId, { type: noticeType, deliveryMethod: noticeDelivery, message: noticeMsg || undefined });
    },
    onSuccess: () => { toast('Notice sent'); setNoticeOpen(false); setNoticeMsg(''); invalidate(); },
    onError: () => toast('Failed to send notice', 'error'),
  });

  const payMutation = useMutation({
    mutationFn: () => {
      const lease = workspace?.lease;
      if (!lease) throw new Error('No active lease');
      return logManualPayment({
        leaseId: lease.id,
        propertyId: lease.propertyId ?? '',
        unitId: lease.unitId ?? undefined,
        tenantId: id,
        amountCents: Math.round(parseFloat(payForm.amountDollars) * 100),
        method: payForm.method,
        referenceNumber: payForm.reference || undefined,
        receivedAt: payForm.receivedAt || undefined,
        appliedTo: payForm.appliedTo || undefined,
        memo: payForm.memo || undefined,
      });
    },
    onSuccess: () => { toast('Payment logged'); setPayOpen(false); setPayForm({ amountDollars: '', method: 'CASH', reference: '', receivedAt: '', appliedTo: 'RENT', memo: '' }); invalidate(); },
    onError: () => toast('Failed to log payment', 'error'),
  });

  const maintMutation = useMutation({
    mutationFn: () => {
      const lease = workspace?.lease;
      return createMaintenanceRequest({
        ...maintForm,
        unitId: lease?.unitId ?? undefined,
        propertyId: lease?.propertyId ?? undefined,
        tenantId: id,
      });
    },
    onSuccess: () => { toast('Maintenance request created'); setMaintOpen(false); setMaintForm({ title: '', category: 'OTHER', priority: 'MEDIUM', description: '' }); invalidate(); },
    onError: () => toast('Failed to create request', 'error'),
  });

  const profileMutation = useMutation({
    mutationFn: () => updateTenantProfile(id, profileForm),
    onSuccess: () => { toast('Profile updated'); setEditingProfile(false); invalidate(); },
    onError: () => toast('Failed to update profile', 'error'),
  });

  const householdMutation = useMutation({
    mutationFn: () => addHouseholdMember(id, householdForm),
    onSuccess: () => { toast('Household member added'); setHouseholdOpen(false); setHouseholdForm({ name: '', relationship: '', phone: '', isOnLease: false, isEmergency: false }); invalidate(); },
    onError: () => toast('Failed to add member', 'error'),
  });

  const violationMutation = useMutation({
    mutationFn: () => addViolation(id, violationForm),
    onSuccess: () => { toast('Violation logged'); setViolationOpen(false); setViolationForm({ type: 'LEASE_VIOLATION', date: '', severity: 'MEDIUM', notes: '' }); invalidate(); },
    onError: () => toast('Failed to log violation', 'error'),
  });

  if (isLoading || !workspace) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
        <div className="flex items-center gap-4">
          <Link
            href="/tenants"
            className="inline-flex size-9 items-center justify-center rounded-[14px] border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] transition-all duration-[180ms] hover:border-[#2B4A73] hover:text-[#F8FAFC]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[#0F1B31]" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}
        </div>
      </div>
    );
  }

  const { profile, lease, summary, health, payments, maintenance, communications, documents, violations, notices } = workspace;
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Unknown';

  return (
    <>
    <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tenants"
            className="inline-flex size-9 items-center justify-center rounded-[14px] border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] transition-all duration-[180ms] hover:border-[#2B4A73] hover:text-[#F8FAFC]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-2.5">
              <UserCheck size={22} className="text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-space)] text-xl font-bold tracking-tight text-[#F8FAFC]">
                {fullName}
              </h1>
              <p className="font-mono text-xs tracking-wider text-[#94A3B8]">
                {summary.status.replace(/_/g, ' ')} · {lease?.unit ?? 'No unit'} · Lease ends {summary.leaseEndsIn}
              </p>
            </div>
          </div>
        </div>
        <TenantHealthBadge classification={health.classification} />
      </div>

      {/* Primary Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setMsgOpen(true)}><MessageSquare size={12} /> Message Tenant</Button>
        <Button size="sm" variant="outline"
          onClick={() => {
            const l = workspace?.lease;
            if (l?.propertyId && l?.unitId) router.push(`/properties/${l.propertyId}/units/${l.unitId}`);
            else toast('No active lease found', 'error');
          }}
        ><DollarSign size={12} /> View Ledger</Button>
        <Button size="sm" variant="outline" onClick={() => setNoticeOpen(true)}><Send size={12} /> Send Notice</Button>
        <Button size="sm" variant="outline" onClick={() => router.push(`/renewals?tenantId=${id}`)}><RefreshCw size={12} /> Start Renewal</Button>
        <Button size="sm" variant="outline" onClick={() => setPayOpen(true)}><DollarSign size={12} /> Log Payment</Button>
        <Button size="sm" variant="outline" onClick={() => setMaintOpen(true)}><Wrench size={12} /> Open Maintenance</Button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Status</p>
          <p className="mt-1 text-sm font-semibold text-[#F8FAFC]">{summary.status.replace(/_/g, ' ')}</p>
        </div>
        <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Payment Health</p>
          <p className={cn('mt-1 text-sm font-semibold', summary.paymentHealth === 'Stable' ? 'text-[#10B981]' : summary.paymentHealth === 'Watch' ? 'text-[#F59E0B]' : 'text-[#F43F5E]')}>
            {summary.paymentHealth}
          </p>
        </div>
        <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Lease</p>
          <p className="mt-1 text-sm font-semibold text-[#F8FAFC]">Ends {summary.leaseEndsIn}</p>
        </div>
        <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Open Issues</p>
          <p className="mt-1 text-sm font-semibold text-[#F8FAFC]">{summary.openIssues}</p>
        </div>
        <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Last Contact</p>
          <p className="mt-1 text-sm font-semibold text-[#F8FAFC]">{summary.lastContact}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#1E3350] pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-all duration-[180ms]',
                activeTab === tab.key
                  ? 'border-[#3B82F6] text-[#F8FAFC]'
                  : 'border-transparent text-[#94A3B8] hover:border-[#2B4A73] hover:text-[#CBD5E1]',
              )}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'profile' && (
          <ProfileSection
            profile={profile}
            editingProfile={editingProfile}
            profileForm={profileForm}
            onEditStart={() => { setProfileForm({ firstName: profile.firstName ?? '', lastName: profile.lastName ?? '', phone: profile.phone ?? '', email: profile.email ?? '', preferredName: profile.preferredName ?? '' }); setEditingProfile(true); }}
            onEditCancel={() => setEditingProfile(false)}
            onProfileChange={(k, v) => setProfileForm((p) => ({ ...p, [k]: v }))}
            onProfileSave={() => profileMutation.mutate()}
            profileSaving={profileMutation.isPending}
            onAddHousehold={() => setHouseholdOpen(true)}
          />
        )}
        {activeTab === 'lease' && (
          <LeaseSection lease={lease} />
        )}
        {activeTab === 'payments' && (
          <PaymentsSection payments={payments} lease={lease} />
        )}
        {activeTab === 'maintenance' && (
          <MaintenanceSection maintenance={maintenance} />
        )}
        {activeTab === 'communications' && (
          <CommsSection communications={communications} />
        )}
        {activeTab === 'documents' && (
          <DocumentsSection documents={documents} />
        )}
        {activeTab === 'compliance' && (
          <ComplianceSection violations={violations} notices={notices} onLogViolation={() => setViolationOpen(true)} />
        )}
        {activeTab === 'health' && (
          <HealthSection health={health} />
        )}
        {activeTab === 'activity' && (
          <ActivitySection events={activityEvents ?? []} />
        )}
      </div>
    </div>

    {/* Message Tenant modal */}
    <Modal open={msgOpen} onClose={() => setMsgOpen(false)} title="Message Tenant"
      footer={<>
        <Button variant="outline" size="sm" onClick={() => setMsgOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={() => messageMutation.mutate()} disabled={!msgBody.trim() || messageMutation.isPending}>
          {messageMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <MessageSquare size={12} />} Send
        </Button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Subject</label>
          <input value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)}
            className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Message <span className="text-[#F43F5E]">*</span></label>
          <textarea value={msgBody} onChange={(e) => setMsgBody(e.target.value)} rows={4}
            className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
        </div>
      </div>
    </Modal>

    {/* Send Notice modal */}
    <Modal open={noticeOpen} onClose={() => setNoticeOpen(false)} title="Send Notice"
      footer={<>
        <Button variant="outline" size="sm" onClick={() => setNoticeOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={() => noticeMutation.mutate()} disabled={noticeMutation.isPending}>
          {noticeMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />} Send
        </Button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Notice type</label>
          <select value={noticeType} onChange={(e) => setNoticeType(e.target.value)}
            className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
            {['MOVE_OUT','RENT_INCREASE','OTHER'].map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Delivery method</label>
          <select value={noticeDelivery} onChange={(e) => setNoticeDelivery(e.target.value)}
            className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
            {['EMAIL','SMS','PORTAL','PRINT','OTHER'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Message (optional)</label>
          <textarea value={noticeMsg} onChange={(e) => setNoticeMsg(e.target.value)} rows={2}
            className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
        </div>
      </div>
    </Modal>

    {/* Log Payment modal */}
    <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Log Manual Payment"
      footer={<>
        <Button variant="outline" size="sm" onClick={() => setPayOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={() => payMutation.mutate()} disabled={!payForm.amountDollars || payMutation.isPending}>
          {payMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <DollarSign size={12} />} Log Payment
        </Button>
      </>}
    >
      <div className="space-y-3">
        {[
          { label: 'Amount ($) *', key: 'amountDollars', type: 'number', placeholder: '1200' },
          { label: 'Reference number', key: 'reference', type: 'text', placeholder: 'CHK-1234' },
          { label: 'Date received', key: 'receivedAt', type: 'date', placeholder: '' },
          { label: 'Memo', key: 'memo', type: 'text', placeholder: 'Optional note' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">{label}</label>
            <input type={type} value={(payForm as any)[key]} placeholder={placeholder}
              onChange={(e) => setPayForm((p) => ({ ...p, [key]: e.target.value }))}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6] [color-scheme:dark]" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Method</label>
            <select value={payForm.method} onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value }))}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {['CASH','CHECK','MONEY_ORDER'].map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Applied to</label>
            <select value={payForm.appliedTo} onChange={(e) => setPayForm((p) => ({ ...p, appliedTo: e.target.value }))}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {['RENT','LATE_FEE','UTILITY','OTHER'].map(a => <option key={a} value={a}>{a.replace('_',' ')}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>

    {/* Open Maintenance modal */}
    <Modal open={maintOpen} onClose={() => setMaintOpen(false)} title="Open Maintenance Request"
      footer={<>
        <Button variant="outline" size="sm" onClick={() => setMaintOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={() => maintMutation.mutate()} disabled={!maintForm.title.trim() || !maintForm.description.trim() || maintMutation.isPending}>
          {maintMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Wrench size={12} />} Submit
        </Button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Title <span className="text-[#F43F5E]">*</span></label>
          <input value={maintForm.title} onChange={(e) => setMaintForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Category</label>
            <select value={maintForm.category} onChange={(e) => setMaintForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {['PLUMBING','ELECTRICAL','HVAC','APPLIANCE','STRUCTURAL','PEST','OTHER'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Priority</label>
            <select value={maintForm.priority} onChange={(e) => setMaintForm((p) => ({ ...p, priority: e.target.value }))}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {['LOW','MEDIUM','HIGH','EMERGENCY'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Description <span className="text-[#F43F5E]">*</span></label>
          <textarea value={maintForm.description} onChange={(e) => setMaintForm((p) => ({ ...p, description: e.target.value }))} rows={3}
            className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
        </div>
      </div>
    </Modal>

    {/* Add Household Member modal */}
    <Modal open={householdOpen} onClose={() => setHouseholdOpen(false)} title="Add Household Member"
      footer={<>
        <Button variant="outline" size="sm" onClick={() => setHouseholdOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={() => householdMutation.mutate()} disabled={!householdForm.name.trim() || !householdForm.relationship.trim() || householdMutation.isPending}>
          {householdMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : null} Add Member
        </Button>
      </>}
    >
      <div className="space-y-3">
        {[
          { label: 'Full name *', key: 'name', placeholder: 'Jane Smith' },
          { label: 'Relationship *', key: 'relationship', placeholder: 'Spouse, Child, Roommate…' },
          { label: 'Phone', key: 'phone', placeholder: '+1 555 000 0000' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">{label}</label>
            <input value={(householdForm as any)[key]} placeholder={placeholder}
              onChange={(e) => setHouseholdForm((p) => ({ ...p, [key]: e.target.value }))}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        ))}
        <div className="flex gap-4">
          {[{ key: 'isOnLease', label: 'On lease' }, { key: 'isEmergency', label: 'Emergency contact' }].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-[#94A3B8]">
              <input type="checkbox" checked={(householdForm as any)[key]}
                onChange={(e) => setHouseholdForm((p) => ({ ...p, [key]: e.target.checked }))}
                className="accent-[#3B82F6]" />
              {label}
            </label>
          ))}
        </div>
      </div>
    </Modal>

    {/* Log Violation modal */}
    <Modal open={violationOpen} onClose={() => setViolationOpen(false)} title="Log Violation"
      footer={<>
        <Button variant="outline" size="sm" onClick={() => setViolationOpen(false)}>Cancel</Button>
        <Button variant="destructive" size="sm" onClick={() => violationMutation.mutate()} disabled={!violationForm.date || violationMutation.isPending}>
          {violationMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <AlertTriangle size={12} />} Log Violation
        </Button>
      </>}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Type</label>
            <select value={violationForm.type} onChange={(e) => setViolationForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {['NOISE','LEASE_VIOLATION','PROPERTY_DAMAGE','UNAUTHORIZED_OCCUPANT','PET_VIOLATION','OTHER'].map(t => (
                <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Severity</label>
            <select value={violationForm.severity} onChange={(e) => setViolationForm((p) => ({ ...p, severity: e.target.value }))}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {['LOW','MEDIUM','HIGH'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Date <span className="text-[#F43F5E]">*</span></label>
          <input type="date" value={violationForm.date} onChange={(e) => setViolationForm((p) => ({ ...p, date: e.target.value }))}
            className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6] [color-scheme:dark]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Notes</label>
          <textarea value={violationForm.notes} onChange={(e) => setViolationForm((p) => ({ ...p, notes: e.target.value }))} rows={2}
            className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
        </div>
      </div>
    </Modal>
    </>
  );
}

function ProfileSection({ profile, editingProfile, profileForm, onEditStart, onEditCancel, onProfileChange, onProfileSave, profileSaving, onAddHousehold }: {
  profile: any; editingProfile: boolean; profileForm: Record<string, string>;
  onEditStart: () => void; onEditCancel: () => void;
  onProfileChange: (k: string, v: string) => void; onProfileSave: () => void;
  profileSaving: boolean; onAddHousehold: () => void;
}) {
  const editableFields = [
    { label: 'First Name', key: 'firstName' },
    { label: 'Last Name', key: 'lastName' },
    { label: 'Preferred Name', key: 'preferredName' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard title="Personal Information" subtitle="Identity & contact details"
        actions={
          editingProfile ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onEditCancel}>Cancel</Button>
              <Button size="sm" onClick={onProfileSave} disabled={profileSaving}>
                {profileSaving ? <RefreshCw size={11} className="animate-spin" /> : <CheckCircle size={11} />} Save
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={onEditStart}>Edit</Button>
          )
        }
      >
        <div className="space-y-3">
          {editingProfile ? (
            editableFields.map(({ label, key }) => (
              <div key={key}>
                <label className="mb-1 block text-[10px] text-[#94A3B8]">{label}</label>
                <input value={profileForm[key] ?? ''} onChange={(e) => onProfileChange(key, e.target.value)}
                  className="w-full rounded-lg border border-[#1E3350] bg-[#0B1628] px-3 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
              </div>
            ))
          ) : (
            [
              { label: 'Legal Name', value: [profile.firstName, profile.lastName].filter(Boolean).join(' ') },
              { label: 'Preferred Name', value: profile.preferredName ?? '—' },
              { label: 'Email', value: profile.email ?? '—' },
              { label: 'Phone', value: profile.phone ?? '—' },
              { label: 'ID Verified', value: profile.idVerified ? 'Yes' : 'Not verified' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
                <span className="text-xs text-[#94A3B8]">{row.label}</span>
                <span className="text-xs font-medium text-[#F8FAFC]">{row.value}</span>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title="Household" subtitle="Occupants & emergency contacts"
        actions={<Button size="sm" variant="outline" onClick={onAddHousehold}><Users size={11} /> Add Member</Button>}
      >
        {(profile.householdMembers ?? []).length === 0 ? (
          <p className="py-4 text-center text-xs text-[#64748B]">No household members recorded</p>
        ) : (
          <div className="space-y-2">
            {(profile.householdMembers ?? []).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-[#F8FAFC]">{m.name}</p>
                  <p className="text-[10px] text-[#64748B]">{m.relationship}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {m.isEmergency && (
                    <span className="rounded-full bg-[#F43F5E]/10 px-2 py-0.5 text-[10px] font-medium text-[#F43F5E]">Emergency</span>
                  )}
                  {m.isOnLease && (
                    <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-medium text-[#3B82F6]">On Lease</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(profile.pets || profile.vehicles) && (
          <div className="mt-4 space-y-2">
            {profile.pets && (
              <div className="flex items-center gap-2 rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
                <PawPrint size={14} className="text-[#F59E0B]" />
                <span className="text-xs text-[#F8FAFC]">
                  {Array.isArray(profile.pets) ? `${profile.pets.length} pet(s)` : 'Pets on file'}
                </span>
              </div>
            )}
            {profile.vehicles && (
              <div className="flex items-center gap-2 rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
                <Car size={14} className="text-[#60A5FA]" />
                <span className="text-xs text-[#F8FAFC]">
                  {Array.isArray(profile.vehicles) ? `${profile.vehicles.length} vehicle(s)` : 'Vehicles on file'}
                </span>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function LeaseSection({ lease }: { lease: any }) {
  if (!lease) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FileText size={28} className="mb-3 text-[#64748B]" />
        <p className="text-sm text-[#94A3B8]">No active lease</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard title="Current Lease" subtitle="Active agreement details">
        <div className="space-y-3">
          {[
            { label: 'Status', value: lease.status },
            { label: 'Unit', value: `${lease.unit} · ${lease.property}` },
            { label: 'Start', value: new Date(lease.startDate).toLocaleDateString() },
            { label: 'End', value: new Date(lease.endDate).toLocaleDateString() },
            { label: 'Days Remaining', value: lease.daysUntilEnd ?? '—' },
            { label: 'Rent', value: `$${lease.rentAmount?.toLocaleString()}/mo` },
            { label: 'Deposit', value: `$${lease.depositAmount?.toLocaleString()}` },
            { label: 'Balance', value: `$${lease.currentBalance?.toLocaleString()}` },
            { label: 'Autopay', value: lease.autopayActive ? 'Active' : 'Not enrolled' },
            { label: 'Renewal', value: lease.renewalStatus ?? 'None' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
              <span className="text-xs text-[#94A3B8]">{row.label}</span>
              <span className="text-xs font-medium text-[#F8FAFC]">{String(row.value)}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Renewal & Transfer" subtitle="Lease lifecycle actions">
        <div className="space-y-3">
          {lease.daysUntilEnd != null && lease.daysUntilEnd <= 90 && (
            <div className="rounded-[14px] border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-[#F59E0B]" />
                <p className="text-xs font-medium text-[#F59E0B]">Lease expires in {lease.daysUntilEnd} days</p>
              </div>
              <Button size="sm" className="mt-2"><RefreshCw size={12} /> Start Renewal</Button>
            </div>
          )}
          <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
            <p className="text-xs text-[#94A3B8]">No renewal history yet.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function PaymentsSection({ payments }: { payments: any; lease: any }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard title="Payment Summary" subtitle="Ledger overview">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] p-3 text-center">
            <p className="text-[10px] uppercase text-[#64748B]">On-Time Rate</p>
            <p className="mt-1 font-mono text-lg font-bold text-[#10B981]">{payments?.onTimeRate ?? 100}%</p>
          </div>
          <div className="rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] p-3 text-center">
            <p className="text-[10px] uppercase text-[#64748B]">Late (6mo)</p>
            <p className="mt-1 font-mono text-lg font-bold text-[#F43F5E]">{payments?.latePayments ?? 0}</p>
          </div>
          <div className="rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] p-3 text-center">
            <p className="text-[10px] uppercase text-[#64748B]">Balance</p>
            <p className={cn('mt-1 font-mono text-lg font-bold', (payments?.currentBalance ?? 0) > 0 ? 'text-[#F43F5E]' : 'text-[#10B981]')}>
              ${(payments?.currentBalance ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] p-3 text-center">
            <p className="text-[10px] uppercase text-[#64748B]">Payment Plan</p>
            <p className="mt-1 text-sm font-bold text-[#F8FAFC]">{payments?.paymentPlanActive ? 'Active' : 'None'}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Recent Payments" subtitle="Last 10 transactions">
        {(payments?.recentPayments ?? []).length === 0 ? (
          <p className="py-4 text-center text-xs text-[#64748B]">No recent payments</p>
        ) : (
          <div className="max-h-[350px] space-y-2 overflow-y-auto">
            {(payments?.recentPayments ?? []).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-[#F8FAFC]">${p.amount?.toLocaleString()}</p>
                  <p className="text-[10px] text-[#64748B]">{new Date(p.date).toLocaleDateString()}</p>
                </div>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  p.status === 'COMPLETED' ? 'bg-[#10B981]/10 text-[#10B981]' : p.status === 'FAILED' ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]',
                )}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function MaintenanceSection({ maintenance }: { maintenance: any[] }) {
  const open = (maintenance ?? []).filter((m: any) => m.status !== 'COMPLETED');
  const resolved = (maintenance ?? []).filter((m: any) => m.status === 'COMPLETED');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard title="Open Requests" subtitle={`${open.length} active`}>
        {open.length === 0 ? (
          <p className="flex items-center gap-2 py-4 text-center text-xs text-[#10B981]"><CheckCircle size={12} /> No open requests</p>
        ) : (
          <div className="space-y-2">
            {open.map((m: any) => {
              const sev: Severity = m.priority === 'EMERGENCY' ? 'critical' : m.priority === 'HIGH' ? 'high' : m.priority === 'MEDIUM' ? 'medium' : 'low';
              return (
                <div key={m.id} className="rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#F8FAFC]">{m.title}</p>
                    <RiskMeter level={sev} className="w-20" />
                  </div>
                  <p className="mt-1 text-[10px] text-[#64748B]">{m.unit?.name} · {m.status} · {new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Resolved" subtitle={`${resolved.length} completed`}>
        {resolved.length === 0 ? (
          <p className="py-4 text-center text-xs text-[#64748B]">No resolved requests</p>
        ) : (
          <div className="max-h-[350px] space-y-2 overflow-y-auto">
            {resolved.slice(0, 10).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-[#F8FAFC]">{m.title}</p>
                  <p className="text-[10px] text-[#64748B]">{m.completedAt ? new Date(m.completedAt).toLocaleDateString() : ''}</p>
                </div>
                <CheckCircle size={14} className="text-[#10B981]" />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function CommsSection({ communications }: { communications: any[] }) {
  const events = (communications ?? []).map((c: any) => ({
    id: `comm-${c.id}`,
    date: c.createdAt,
    type: 'communication' as const,
    title: `${c.channel} ${c.direction.toLowerCase()}`,
    details: c.subject ?? c.message?.slice(0, 100),
  }));

  return (
    <SectionCard title="Communication Timeline" subtitle="Emails, SMS, notices, calls">
      <CommunicationTimeline events={events} />
    </SectionCard>
  );
}

function DocumentsSection({ documents }: { documents: any[] }) {
  return (
    <SectionCard title="Documents" subtitle="Lease, addenda, ID, inspections">
      {(documents ?? []).length === 0 ? (
        <p className="py-4 text-center text-xs text-[#64748B]">No documents uploaded</p>
      ) : (
        <div className="space-y-2">
          {(documents ?? []).map((d: any) => (
            <div key={d.id} className="flex items-center justify-between rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[#3B82F6]" />
                <div>
                  <p className="text-xs font-medium text-[#F8FAFC]">{d.fileName}</p>
                  <p className="text-[10px] text-[#64748B]">{d.category} · {new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function ComplianceSection({ violations, notices, onLogViolation }: { violations: any[]; notices: any[]; onLogViolation: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard title="Violations" subtitle="Lease violations & warnings"
        actions={<Button size="sm" variant="outline" onClick={onLogViolation}><AlertTriangle size={11} /> Log Violation</Button>}
      >
        {(violations ?? []).length === 0 ? (
          <p className="flex items-center gap-2 py-4 text-center text-xs text-[#10B981]"><CheckCircle size={12} /> No open violations</p>
        ) : (
          <div className="space-y-2">
            {(violations ?? []).map((v: any) => (
              <div key={v.id} className="rounded-[10px] border border-[#F43F5E]/20 bg-[#F43F5E]/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#F8FAFC]">{v.type}</p>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    v.severity === 'CRITICAL' ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]',
                  )}>
                    {v.severity}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-[#94A3B8]">{v.description}</p>
                <p className="mt-1 text-[10px] text-[#64748B]">Issued {new Date(v.issuedAt ?? v.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Notices Sent" subtitle="Compliance & legal notices">
        {(notices ?? []).length === 0 ? (
          <p className="py-4 text-center text-xs text-[#64748B]">No notices on file</p>
        ) : (
          <div className="space-y-2">
            {(notices ?? []).map((n: any) => (
              <div key={n.id} className="flex items-center justify-between rounded-[10px] border border-[#1E3350]/50 bg-[#0B1628] px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-[#F8FAFC]">{n.type.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-[#64748B]">{n.message?.slice(0, 60) ?? ''}</p>
                </div>
                <span className="text-[10px] text-[#64748B]">{new Date(n.sentAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function HealthSection({ health }: { health: any }) {
  const dims = health.dimensions ?? {};
  const bars = [
    { label: 'Payment Stability', value: dims.paymentStability ?? 0 },
    { label: 'Maintenance Friction', value: dims.maintenanceFriction ?? 0 },
    { label: 'Communication', value: dims.communicationResponsiveness ?? 0 },
    { label: 'Renewal Likelihood', value: dims.renewalLikelihood ?? 0 },
    { label: 'Compliance Risk', value: dims.complianceRisk ?? 0 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard title="Tenant Health" subtitle="AI-derived operational assessment">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <TenantHealthBadge classification={health.classification} />
            <p className="mt-2 font-mono text-2xl font-bold text-[#F8FAFC]">{health.score}/100</p>
          </div>
        </div>

        <div className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">{bar.label}</span>
                <span className="font-mono text-xs text-[#F8FAFC]">{Math.round(bar.value)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1E3350]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    bar.value >= 80 ? 'bg-[#10B981]' : bar.value >= 60 ? 'bg-[#F59E0B]' : 'bg-[#F43F5E]',
                  )}
                  style={{ width: `${bar.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Signals & Actions" subtitle="Recommended next steps">
        {(health.signals ?? []).length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Signals</p>
            {health.signals.map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-[10px] border border-[#F59E0B]/10 bg-[#F59E0B]/5 px-3 py-2">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                <span className="text-xs text-[#F8FAFC]">{s}</span>
              </div>
            ))}
          </div>
        )}

        {(health.actions ?? []).length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Actions</p>
            <div className="flex flex-wrap gap-2">
              {health.actions.map((a: string, i: number) => (
                <Button key={i} size="sm" variant="outline">{a}</Button>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function ActivitySection({ events }: { events: any[] }) {
  return (
    <SectionCard title="Activity Timeline" subtitle="Chronological cross-module events">
      <CommunicationTimeline events={events ?? []} />
    </SectionCard>
  );
}
