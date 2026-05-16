'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Building2, Plus, DollarSign, FileText, PieChart, Users, ArrowRight } from 'lucide-react';
import { WorkspaceShell, SectionCard, MetricCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { createOwnerDraw, fetchOwnerDraws } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

export default function OwnerPortalPage() {
  const { toast } = useToast();
  const [statementId, setStatementId] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', bankAccount: '' });
  
  const { data, refetch, isLoading } = useQuery({ 
    queryKey: ['owner-draws', statementId], 
    queryFn: () => fetchOwnerDraws(statementId), 
    enabled: !!statementId 
  });
  
  const draws = Array.isArray(data) ? data : [];
  
  const mutation = useMutation({ 
    mutationFn: () => createOwnerDraw(statementId, { ...form, amount: Number(form.amount) || 0 }), 
    onSuccess: () => { 
      toast('Owner draw initiated'); 
      setOpen(false); 
      setForm({ amount: '', bankAccount: '' });
      refetch(); 
    } 
  });

  return (
    <>
      <WorkspaceShell 
        title="Owner Portal" 
        subtitle="Manage owner distributions, statements, and communications" 
        icon={Building2} 
        actions={
          <Button size="sm" onClick={() => setOpen(true)} disabled={!statementId}>
            <Plus size={12} /> Initiate Draw
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          <MetricCard label="Total Owners" value="12" />
          <MetricCard label="Pending Draws" value="3" variant="warning" />
          <MetricCard label="Statements Generated" value="48" variant="success" />
          <MetricCard label="Avg Portfolio Yield" value="6.2%" variant="info" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Statement & Draws Lookup" subtitle="View distributions and initiate new draws by statement ID">
              <div className="flex gap-2 mb-4">
                <input 
                  value={statementId} 
                  onChange={(e) => setStatementId(e.target.value)} 
                  placeholder="Enter Statement ID (e.g., stmt_123)" 
                  className="flex-1 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" 
                />
                <Button variant="outline" onClick={() => refetch()} disabled={!statementId || isLoading}>
                  Search
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-[#0F1B31]" />)}</div>
              ) : statementId && draws.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-[#1E3350] p-6 text-center">
                  <p className="text-sm text-[#94A3B8]">No draws found for this statement.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {draws.map((draw: any) => (
                    <div key={draw.id} className="flex items-center justify-between rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-4 transition-colors hover:border-[#2B4A73]">
                      <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">${Number(draw.amount ?? 0).toLocaleString()}</p>
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          Account: {draw.bankAccount ?? 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex rounded-full border border-[#1E3350] bg-[#07111F] px-2 py-0.5 text-[10px] font-medium text-[#94A3B8] uppercase">
                          {draw.status ?? 'Pending'}
                        </span>
                        <p className="mt-1 text-xs text-[#475569]">
                          {new Date(draw.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Quick Actions" subtitle="Common owner tasks">
              <div className="space-y-2">
                <Link href="/financials" className="group flex items-center justify-between rounded-lg border border-[#1E3350] bg-[#0F1B31] p-3 transition-colors hover:border-[#3B82F6]">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-[#94A3B8] group-hover:text-[#3B82F6]" />
                    <span className="text-sm font-medium text-[#F8FAFC]">Generate Statements</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#475569] group-hover:text-[#3B82F6]" />
                </Link>
                <Link href="/portfolio" className="group flex items-center justify-between rounded-lg border border-[#1E3350] bg-[#0F1B31] p-3 transition-colors hover:border-[#3B82F6]">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-4 w-4 text-[#94A3B8] group-hover:text-[#3B82F6]" />
                    <span className="text-sm font-medium text-[#F8FAFC]">Portfolio Performance</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#475569] group-hover:text-[#3B82F6]" />
                </Link>
                <div className="group flex cursor-not-allowed items-center justify-between rounded-lg border border-[#1E3350] bg-[#0F1B31] p-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-[#94A3B8]" />
                    <span className="text-sm font-medium text-[#F8FAFC]">Owner Directory</span>
                  </div>
                  <span className="rounded-full border border-[#1E3350] bg-[#07111F] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#94A3B8]">Soon</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </WorkspaceShell>

      <Modal 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Initiate Owner Draw" 
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => mutation.mutate()} disabled={!form.amount || mutation.isPending}>
              {mutation.isPending ? 'Processing...' : 'Save Draw'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3 text-sm text-[#F8FAFC]">
            Initiating draw for Statement <span className="font-mono text-[#3B82F6]">{statementId}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              ['Amount ($)', 'amount', 'e.g. 1500.00'], 
              ['Bank Account', 'bankAccount', 'e.g. Chase ****1234']
            ].map(([label, key, placeholder]) => (
              <label key={key} className="block text-sm text-[#94A3B8]">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input 
                  type={key === 'amount' ? 'number' : 'text'}
                  value={(form as any)[key]} 
                  onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} 
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" 
                />
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
