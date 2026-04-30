'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar,DollarSign,Home,Save,User,X } from 'lucide-react';
import { useState } from 'react';

export interface LeaseFormData {
  id?: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  securityDeposit: number;
  leaseType: 'fixed-term' | 'month-to-month';
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated';
  moveInAt?: string;
  moveOutAt?: string;
  noticePeriodDays?: number;
  autoRenew?: boolean;
  autoRenewLeadDays?: number;
}

interface LeaseFormProps {
  initialData?: LeaseFormData;
  tenantOptions?: { id: string; name: string }[];
  propertyOptions?: { id: string; name: string }[];
  onSave: (data: LeaseFormData) => void;
  onCancel: () => void;
}

export function LeaseForm({ initialData, tenantOptions = [], propertyOptions = [], onSave, onCancel }: LeaseFormProps) {
  const [form, setForm] = useState<LeaseFormData>(() => initialData || {
    tenantId: '',
    propertyId: '',
    unitId: '',
    leaseStart: new Date().toISOString().split('T')[0],
    leaseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyRent: 0,
    securityDeposit: 0,
    leaseType: 'fixed-term',
    status: 'draft',
  });

  const handleChange = (field: keyof LeaseFormData, value: string | number | boolean | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">
          {initialData?.id ? 'Edit Lease' : 'Create Lease'}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Property</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
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
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Unit</label>
          <Input
            value={form.unitId}
            onChange={(e) => handleChange('unitId', e.target.value)}
            placeholder="Unit ID"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Lease Type</label>
          <select
            value={form.leaseType}
            onChange={(e) => handleChange('leaseType', e.target.value as LeaseFormData['leaseType'])}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
          >
            <option value="fixed-term">Fixed Term</option>
            <option value="month-to-month">Month-to-Month</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Lease Start</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.leaseStart}
              onChange={(e) => handleChange('leaseStart', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Lease End</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.leaseEnd}
              onChange={(e) => handleChange('leaseEnd', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Monthly Rent</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.monthlyRent}
              onChange={(e) => handleChange('monthlyRent', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Security Deposit</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.securityDeposit}
              onChange={(e) => handleChange('securityDeposit', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value as LeaseFormData['status'])}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Move In Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.moveInAt || ''}
              onChange={(e) => handleChange('moveInAt', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Move Out Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.moveOutAt || ''}
              onChange={(e) => handleChange('moveOutAt', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Notice Period (days)</label>
          <Input
            type="number"
            value={form.noticePeriodDays ?? ''}
            onChange={(e) => handleChange('noticePeriodDays', e.target.value ? Number(e.target.value) : 0)}
            placeholder="30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Auto Renew</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#0F1B31] p-3">
            <input
              type="checkbox"
              checked={form.autoRenew ?? false}
              onChange={(e) => handleChange('autoRenew', e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <span className="text-sm text-[#F8FAFC]">Enable auto-renewal</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Auto Renew Lead Days</label>
          <Input
            type="number"
            value={form.autoRenewLeadDays ?? ''}
            onChange={(e) => handleChange('autoRenewLeadDays', e.target.value ? Number(e.target.value) : 0)}
            placeholder="60"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          {initialData?.id ? 'Update' : 'Create'} Lease
        </Button>
      </div>
    </form>
  );
}