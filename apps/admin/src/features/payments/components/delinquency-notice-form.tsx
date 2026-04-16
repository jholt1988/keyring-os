'use client';

import { useState } from 'react';
import { AlertTriangle, Mail, Mailbox, FileText, X, Save, Building, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface DelinquencyNoticeFormData {
  leaseId: string;
  deliveryMethod: 'EMAIL' | 'MAIL' | 'SMS' | 'IN_PERSON';
  approvalConfirmed: boolean;
  message?: string;
}

interface DelinquencyNoticeFormProps {
  initialData?: DelinquencyNoticeFormData;
  leaseOptions?: { id: string; address: string }[];
  onSave: (data: DelinquencyNoticeFormData) => void;
  onCancel: () => void;
}

export function DelinquencyNoticeForm({ 
  initialData, 
  leaseOptions = [], 
  onSave, 
  onCancel 
}: DelinquencyNoticeFormProps) {
  const [form, setForm] = useState<DelinquencyNoticeFormData>(initialData || {
    leaseId: '',
    deliveryMethod: 'EMAIL',
    approvalConfirmed: false,
    message: '',
  });

  const handleChange = (field: keyof DelinquencyNoticeFormData, value: string | boolean | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Issue Delinquency Notice</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">Delinquency Notice</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              This will initiate the formal delinquency notice process for the tenant.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Lease</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.leaseId}
              onChange={(e) => handleChange('leaseId', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
              required
            >
              <option value="">Select lease</option>
              {leaseOptions.map((l) => (
                <option key={l.id} value={l.id}>{l.address}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Delivery Method</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.deliveryMethod}
              onChange={(e) => handleChange('deliveryMethod', e.target.value as DelinquencyNoticeFormData['deliveryMethod'])}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
            >
              <option value="EMAIL">Email</option>
              <option value="MAIL">Mail</option>
              <option value="SMS">SMS</option>
              <option value="IN_PERSON">In Person</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Support Message</label>
          <Input
            value={form.message || ''}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder="Additional message (optional)"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-[#0F1B31] p-4">
            <input
              type="checkbox"
              checked={form.approvalConfirmed}
              onChange={(e) => handleChange('approvalConfirmed', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <div>
              <span className="text-sm text-[#F8FAFC]">I confirm approval to proceed</span>
              <p className="text-xs text-[#94A3B8] mt-1">
                By checking this box, you authorize sending the delinquency notice to the tenant.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={!form.approvalConfirmed}>
          <FileText size={14} />
          Issue Notice
        </Button>
      </div>
    </form>
  );
}