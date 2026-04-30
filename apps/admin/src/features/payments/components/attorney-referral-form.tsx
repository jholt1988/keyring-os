'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle,FileText,Mail,User,X } from 'lucide-react';
import { useState } from 'react';

export interface AttorneyReferralFormData {
  leaseId: string;
  attorneyEmail: string;
  attorneyName?: string;
  summary?: string;
  approvalConfirmed: boolean;
}

interface AttorneyReferralFormProps {
  onSave: (data: AttorneyReferralFormData) => void;
  onCancel: () => void;
}

export function AttorneyReferralForm({ onSave, onCancel }: AttorneyReferralFormProps) {
  const [form, setForm] = useState<AttorneyReferralFormData>({
    leaseId: '',
    attorneyEmail: '',
    attorneyName: '',
    summary: '',
    approvalConfirmed: false,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Refer to Attorney</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B] mt-0.5" />
          <div>
            <p className="text-sm text-[#F59E0B]">Legal action - use with caution</p>
            <p className="text-xs text-[#94A3B8] mt-1">This will refer the delinquency case to the specified attorney.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Attorney Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="email" value={form.attorneyEmail} onChange={(e) => setForm((prev) => ({ ...prev, attorneyEmail: e.target.value }))} placeholder="attorney@lawfirm.com" className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Attorney Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input value={form.attorneyName || ''} onChange={(e) => setForm((prev) => ({ ...prev, attorneyName: e.target.value }))} placeholder="Optional" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Case Summary</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <textarea value={form.summary || ''} onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))} className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" placeholder="Summary of delinquency case..." />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#0F1B31] p-3">
            <input type="checkbox" checked={form.approvalConfirmed} onChange={(e) => setForm((prev) => ({ ...prev, approvalConfirmed: e.target.checked }))} className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#F43F5E] focus:ring-[#F43F5E]" />
            <span className="text-sm text-[#F8FAFC]">I confirm approval to proceed with legal referral</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="destructive" disabled={!form.approvalConfirmed}><Mail size={14} /> Refer to Attorney</Button>
      </div>
    </form>
  );
}