'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building, Download, Plus, RefreshCw } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { createVendor, fetchVendors, getVendors1099ExportUrl } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function VendorsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', contact: '' });
  const { data, isLoading } = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });
  const vendors = Array.isArray(data) ? data : [];
  const mutation = useMutation({
    mutationFn: () => createVendor(form),
    onSuccess: () => { toast('Vendor created'); setOpen(false); setForm({ name: '', type: '', contact: '' }); qc.invalidateQueries({ queryKey: ['vendors'] }); },
    onError: () => toast('Failed to create vendor', 'error'),
  });

  return (
    <>
      <WorkspaceShell title="Vendors" subtitle="Vendor management and 1099 export" icon={Building} actions={<><Button size="sm" variant="outline" onClick={() => window.open(getVendors1099ExportUrl(), '_blank', 'noopener,noreferrer')}><Download size={12} /> Export 1099</Button><Button size="sm" onClick={() => setOpen(true)}><Plus size={12} /> Add Vendor</Button></>}>
        <SectionCard title="Vendor Directory" subtitle="Name, type, and contact coverage">
          {isLoading ? <p className="text-sm text-[#94A3B8]">Loading vendors…</p> : vendors.length === 0 ? <p className="text-sm text-[#94A3B8]">No vendors found.</p> : (
            <div className="space-y-3">{vendors.map((vendor: any) => <div key={vendor.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-sm font-medium text-[#F8FAFC]">{vendor.name}</p><p className="text-xs text-[#94A3B8]">{vendor.type ?? 'Vendor'} · {vendor.contact ?? vendor.email ?? vendor.phone ?? 'No contact'}</p></div>)}</div>
          )}
        </SectionCard>
      </WorkspaceShell>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Vendor" footer={<><Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Save</Button></>}>
        <div className="grid grid-cols-1 gap-3">{[['Name', 'name'], ['Type', 'type'], ['Contact', 'contact']].map(([label, key]) => <label key={key} className="text-sm text-[#94A3B8]"><span className="mb-1 block">{label}</span><input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /></label>)}</div>
      </Modal>
    </>
  );
}
