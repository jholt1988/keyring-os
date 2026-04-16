'use client';

import { useState } from 'react';
import { Building, User, DollarSign, FileText, Calendar, X, Save, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface ManualChargeFormData {
  leaseId: string;
  propertyId: string;
  unitId?: string;
  tenantId: string;
  chargeType: 'RENT' | 'DEPOSIT' | 'LATE_FEE' | 'UTILITIES' | 'MAINTENANCE' | 'LEGAL' | 'OTHER';
  amountCents: number;
  description: string;
  chargeDate?: string;
  dueDate?: string;
}

interface ManualChargeFormProps {
  initialData?: ManualChargeFormData;
  leaseOptions?: { id: string; address: string }[];
  propertyOptions?: { id: string; name: string }[];
  tenantOptions?: { id: string; name: string }[];
  onSave: (data: ManualChargeFormData) => void;
  onCancel: () => void;
}

export function ManualChargeForm({ 
  initialData, 
  leaseOptions = [], 
  propertyOptions = [],
  tenantOptions = [],
  onSave, 
  onCancel 
}: ManualChargeFormProps) {
  const [form, setForm] = useState<ManualChargeFormData>(initialData || {
    leaseId: '',
    propertyId: '',
    unitId: '',
    tenantId: '',
    chargeType: 'RENT',
    amountCents: 0,
    description: '',
    chargeDate: '',
    dueDate: '',
  });

  const handleChange = (field: keyof ManualChargeFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Create Manual Charge</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Property</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.propertyId}
              onChange={(e) => handleChange('propertyId', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
              required
            >
              <option value="">Select property</option>
              {propertyOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Lease</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
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
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Tenant</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.tenantId}
              onChange={(e) => handleChange('tenantId', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
              required
            >
              <option value="">Select tenant</option>
              {tenantOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Charge Type</label>
          <select
            value={form.chargeType}
            onChange={(e) => handleChange('chargeType', e.target.value as ManualChargeFormData['chargeType'])}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
          >
            <option value="RENT">Rent</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="LATE_FEE">Late Fee</option>
            <option value="UTILITIES">Utilities</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="LEGAL">Legal</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Amount (cents)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.amountCents}
              onChange={(e) => handleChange('amountCents', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Charge Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.chargeDate || ''}
              onChange={(e) => handleChange('chargeDate', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Due Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              placeholder="Charge description..."
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          Create Charge
        </Button>
      </div>
    </form>
  );
}