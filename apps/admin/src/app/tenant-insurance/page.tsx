'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Shield, Plus, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { WorkspaceShell, SectionCard, MetricCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { fetchTenantInsurance, recordTenantInsurance } from '@/lib/operator/tenant-insurance';
import { useToast } from '@/components/ui/toast';

export default function TenantInsurancePage() {
  const { toast } = useToast();
  const [leaseId, setLeaseId] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ provider: '', policyNumber: '', coverageAmount: '', expiry: '' });
  
  const { data, refetch, isLoading } = useQuery({ 
    queryKey: ['tenant-insurance', leaseId], 
    queryFn: () => fetchTenantInsurance(leaseId), 
    enabled: !!leaseId 
  });
  
  const policies = Array.isArray(data) ? data : [];
  
  const mutation = useMutation({ 
    mutationFn: () => recordTenantInsurance(leaseId, { ...form, coverageAmount: Number(form.coverageAmount) || 0 }), 
    onSuccess: () => { 
      toast('Policy recorded successfully'); 
      setOpen(false);
      setForm({ provider: '', policyNumber: '', coverageAmount: '', expiry: '' });
      refetch(); 
    } 
  });

  return (
    <>
      <WorkspaceShell 
        title="Tenant Insurance" 
        subtitle="Track insurance compliance and policy status across your portfolio" 
        icon={Shield} 
        actions={
          <Button size="sm" onClick={() => setOpen(true)} disabled={!leaseId}>
            <Plus size={12} /> Record Policy
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <MetricCard label="Active Policies" value="245" variant="success" />
          <MetricCard label="Missing Coverage" value="18" variant="danger" />
          <MetricCard label="Expiring Soon (30d)" value="12" variant="warning" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Policy Verification" subtitle="Enter a lease ID to view associated insurance policies">
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input 
                    value={leaseId} 
                    onChange={(e) => setLeaseId(e.target.value)} 
                    placeholder="Search by Lease ID..." 
                    className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] py-2 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#8A99AD] outline-none focus:border-[#3B82F6]" 
                  />
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={!leaseId || isLoading}>
                  Search
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-[#0F1B31]" />)}</div>
              ) : leaseId && policies.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-[#1E3350] p-8 text-center">
                  <Shield size={32} className="mx-auto mb-3 text-[#1E3350]" />
                  <p className="text-sm font-medium text-[#F8FAFC]">No policies found</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">There are no insurance records for this lease.</p>
                  <Button size="sm" variant="outline" className="mt-4" onClick={() => setOpen(true)}>
                    <Plus size={12} /> Add First Policy
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy: any) => {
                    const isExpired = String(policy.expiry ?? policy.expiryDate) < new Date().toISOString();
                    return (
                      <div key={policy.id} className="flex items-center justify-between rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-4 transition-colors hover:border-[#2B4A73]">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isExpired ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                            {isExpired ? <AlertTriangle size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-green-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#F8FAFC]">{policy.provider}</p>
                            <p className="mt-1 text-xs text-[#94A3B8]">
                              Policy #{policy.policyNumber} · ${Number(policy.coverageAmount ?? 0).toLocaleString()} coverage
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${isExpired ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                          <p className="mt-1 text-xs text-[#8A99AD]">
                            Exp: {new Date(policy.expiry ?? policy.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Compliance Rules" subtitle="Minimum requirements">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-[#1E3350] pb-2">
                  <span className="text-[#94A3B8]">Liability Coverage</span>
                  <span className="font-medium text-[#F8FAFC]">$100,000</span>
                </div>
                <div className="flex justify-between border-b border-[#1E3350] pb-2">
                  <span className="text-[#94A3B8]">Personal Property</span>
                  <span className="font-medium text-[#F8FAFC]">$10,000</span>
                </div>
                <div className="flex justify-between border-b border-[#1E3350] pb-2">
                  <span className="text-[#94A3B8]">Interested Party</span>
                  <span className="font-medium text-[#F8FAFC]">Required</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-[#94A3B8]">Deductible Max</span>
                  <span className="font-medium text-[#F8FAFC]">$500</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </WorkspaceShell>

      <Modal 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Record Insurance Policy" 
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => mutation.mutate()} disabled={!form.provider || !form.policyNumber || mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Policy'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3 text-sm text-[#F8FAFC]">
            Recording policy for Lease <span className="font-mono text-[#3B82F6]">{leaseId}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ['Provider Name', 'provider', 'e.g. Lemonade', 'text'], 
              ['Policy Number', 'policyNumber', 'e.g. POL-12345', 'text'], 
              ['Coverage Amount', 'coverageAmount', 'e.g. 100000', 'number'], 
              ['Expiry Date', 'expiry', '', 'date']
            ].map(([label, key, placeholder, type]) => (
              <label key={key} className={`block text-sm text-[#94A3B8] ${key === 'provider' ? 'sm:col-span-2' : ''}`}>
                <span className="mb-1.5 block font-medium">{label}</span>
                <input 
                  type={type}
                  value={(form as any)[key]} 
                  onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} 
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#8A99AD] outline-none focus:border-[#3B82F6]" 
                />
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
