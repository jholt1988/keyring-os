'use client';

import { useTenantsIndex } from '@/app/hooks/useWorkspace';
import { MetricCard,WorkspaceShell } from '@/components/copilot';
import { TenantCard,TenantHealthBadge } from '@/components/tenant';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { createMessageThread, recordTenantNotice } from '@/lib/copilot-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
AlertTriangle,
Calendar,
Clock,
FileText,
MessageSquare,
RefreshCw,
Search,
Send,
UserCheck,
Users,
XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useMemo,useState } from 'react';

const filterTabs = [
  { key: 'all', label: 'All Tenants', icon: Users },
  { key: 'attention', label: 'Needs Attention', icon: AlertTriangle },
  { key: 'movein', label: 'New Move-ins', icon: Calendar },
  { key: 'delinquent', label: 'Delinquent', icon: XCircle },
  { key: 'renewal', label: 'Renewal Candidates', icon: RefreshCw },
  { key: 'former', label: 'Former Tenants', icon: Clock },
];

export default function TenantsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Message modal
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');

  // Notice modal
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeType, setNoticeType] = useState('GENERAL');
  const [noticeMethod, setNoticeMethod] = useState('EMAIL');
  const [noticeMessage, setNoticeMessage] = useState('');

  const { toast } = useToast();
  const qc = useQueryClient();

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (searchQuery) p.search = searchQuery;
    if (activeTab === 'delinquent') p.delinquent = 'true';
    if (activeTab === 'renewal') p.leaseEndingSoon = 'true';
    if (activeTab === 'attention') p.healthClass = 'AT_RISK';
    if (activeTab === 'former') p.former = 'true';
    if (activeTab === 'movein') p.status = 'ONBOARDING';
    return p;
  }, [activeTab, searchQuery]);

  const { data, isLoading } = useTenantsIndex(params);
  const tenants = (data as any)?.data ?? [];
  const total = (data as any)?.total ?? 0;

  const selectedTenant = tenants.find((t: any) => t.id === selectedTenantId);

  const atRiskCount = tenants.filter((t: any) => t.healthClass === 'AT_RISK' || t.healthClass === 'HIGH_TOUCH').length;
  const delinquentCount = tenants.filter((t: any) => t.status === 'DELINQUENT').length;
  const renewalCount = tenants.filter((t: any) => t.daysUntilLeaseEnd != null && t.daysUntilLeaseEnd <= 90 && t.daysUntilLeaseEnd > 0).length;

  const messageMutation = useMutation({
    mutationFn: () =>
      createMessageThread({
        subject: msgSubject || `Message to ${selectedTenant?.firstName ?? 'Tenant'}`,
        content: msgBody,
        participantIds: [selectedTenant?.userId ?? selectedTenant?.id].filter(Boolean),
      }),
    onSuccess: () => {
      toast('Message sent');
      setMsgOpen(false);
      setMsgSubject('');
      setMsgBody('');
    },
    onError: () => toast('Failed to send message', 'error'),
  });

  const noticeMutation = useMutation({
    mutationFn: () =>
      recordTenantNotice(selectedTenant?.leaseId, {
        type: noticeType,
        deliveryMethod: noticeMethod,
        message: noticeMessage || undefined,
      }),
    onSuccess: () => {
      toast('Notice recorded');
      setNoticeOpen(false);
      setNoticeType('GENERAL');
      setNoticeMethod('EMAIL');
      setNoticeMessage('');
      qc.invalidateQueries({ queryKey: ['workspace', 'tenants'] });
    },
    onError: () => toast('Failed to record notice', 'error'),
  });


  return (
    <WorkspaceShell title="Tenants" subtitle="Resident Relationship Management" icon={UserCheck}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={total} label="Total Tenants" variant="info" />
        <MetricCard value={atRiskCount} label="At Risk" variant="danger" />
        <MetricCard value={delinquentCount} label="Delinquent" variant="warning" />
        <MetricCard value={renewalCount} label="Renewal Due" variant="success" />
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedTenantId(null); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-[180ms] ${
                activeTab === tab.key
                  ? 'border-[#3B82F6]/40 bg-[#17304E] text-[#F8FAFC]'
                  : 'border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] hover:border-[#2B4A73] hover:text-[#CBD5E1]'
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Tenant List */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search tenants by name, email, unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[14px] border border-[#1E3350] bg-[#0F1B31] py-2.5 pl-9 pr-4 text-sm text-[#F8FAFC] placeholder-[#64748B] transition-all duration-[180ms] focus:border-[#3B82F6]/40 focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/20"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-[14px] bg-[#0F1B31]" />
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#1E3350] bg-[#0F1B31] py-16">
              <Users size={32} className="mb-3 text-[#64748B]" />
              <p className="text-sm font-medium text-[#94A3B8]">No tenants found</p>
              <p className="mt-1 text-xs text-[#64748B]">Try adjusting your filters or search</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tenants.map((tenant: any) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  isSelected={selectedTenantId === tenant.id}
                  onClick={() => setSelectedTenantId(tenant.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Context Panel */}
        <div className="hidden lg:block">
          {selectedTenant ? (
            <div className="sticky top-8 rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5">
              <div className="mb-4">
                <h3 className="font-[family-name:var(--font-space)] text-base font-bold text-[#F8FAFC]">
                  {[selectedTenant.firstName, selectedTenant.lastName].filter(Boolean).join(' ')}
                </h3>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {selectedTenant.property} · {selectedTenant.unit}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <TenantHealthBadge classification={selectedTenant.healthClass} />
                  <span className="text-xs text-[#64748B]">{selectedTenant.status.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="mb-4 space-y-2 rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Rent</span>
                  <span className="font-mono text-[#F8FAFC]">${selectedTenant.rentAmount?.toLocaleString() ?? '—'}/mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Balance</span>
                  <span className={`font-mono ${(selectedTenant.currentBalance ?? 0) > 0 ? 'text-[#F43F5E]' : 'text-[#10B981]'}`}>
                    ${(selectedTenant.currentBalance ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Lease ends</span>
                  <span className="font-mono text-[#F8FAFC]">
                    {selectedTenant.daysUntilLeaseEnd != null ? `${selectedTenant.daysUntilLeaseEnd}d` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Open issues</span>
                  <span className="font-mono text-[#F8FAFC]">{selectedTenant.openMaintenanceCount ?? 0}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href={`/tenants/${selectedTenant.id}`}>
                  <Button size="sm" className="w-full">
                    <FileText size={12} /> Open Workspace
                  </Button>
                </Link>
                  <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMsgOpen(true)}
                  >
                    <MessageSquare size={12} /> Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNoticeOpen(true)}
                    disabled={!selectedTenant?.leaseId}
                  >
                    <Send size={12} /> Notice
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-8 flex flex-col items-center justify-center rounded-[24px] border border-[#1E3350] bg-[#0F1B31] py-20">
              <UserCheck size={28} className="mb-3 text-[#64748B]" />
              <p className="text-sm text-[#94A3B8]">Select a tenant</p>
              <p className="mt-1 text-xs text-[#64748B]">Click any row to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      <Modal
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        title={`Message ${selectedTenant ? [selectedTenant.firstName, selectedTenant.lastName].filter(Boolean).join(' ') : 'Tenant'}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setMsgOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => messageMutation.mutate()}
              disabled={!msgBody.trim() || messageMutation.isPending}
            >
              {messageMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <MessageSquare size={13} />} Send
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Subject (optional)</label>
            <input
              type="text"
              value={msgSubject}
              onChange={(e) => setMsgSubject(e.target.value)}
              placeholder="Lease renewal, maintenance update..."
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Message <span className="text-[#F43F5E]">*</span></label>
            <textarea
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
              rows={4}
              placeholder="Type your message..."
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>
      </Modal>

      {/* Notice Modal */}
      <Modal
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        title="Record Notice"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNoticeOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => noticeMutation.mutate()}
              disabled={noticeMutation.isPending}
            >
              {noticeMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />} Record
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Notice type</label>
            <select
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]"
            >
              {['GENERAL', 'MOVE_OUT', 'LEASE_VIOLATION', 'RENT_INCREASE', 'LEASE_RENEWAL', 'ENTRY_NOTICE'].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Delivery method</label>
            <select
              value={noticeMethod}
              onChange={(e) => setNoticeMethod(e.target.value)}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]"
            >
              {['EMAIL', 'PORTAL', 'CERTIFIED_MAIL', 'IN_PERSON', 'POSTED'].map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Message (optional)</label>
            <textarea
              value={noticeMessage}
              onChange={(e) => setNoticeMessage(e.target.value)}
              rows={3}
              placeholder="Additional context for this notice..."
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>
      </Modal>
    </WorkspaceShell>
  );
}
