'use client';

import { useState } from 'react';
import { Building, User, DollarSign, Calendar, X, Save, Hash, FileText, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface ManualPaymentFormData {
  leaseId: string;
  propertyId: string;
  unitId?: string;
  tenantId: string;
  amountCents: number;
  method: 'CASH' | 'CHECK' | 'MONEY_ORDER' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER';
  referenceNumber?: string;
  receivedAt?: string;
  appliedTo?: 'CURRENT_RENT' | 'ARREARS' | 'DEPOSIT' | 'FEES' | 'UTILITIES';
  memo?: string;
}

interface ManualPaymentFormProps {
  initialData?: ManualPaymentFormData;
  leaseOptions?: { id: string; address: string }[];
  propertyOptions?: { id: string; name: string }[];
  tenantOptions?: { id: string; name: string }[];
  onSave: (data: ManualPaymentFormData) => void;
  onCancel: () => void;
}

export function ManualPaymentForm({ 
  initialData, 
  leaseOptions = [], 
  propertyOptions = [],
  tenantOptions = [],
  onSave, 
  onCancel 
}: ManualPaymentFormProps) {
  const [form, setForm] = useState<ManualPaymentFormData>(initialData || {
    leaseId: '',
    propertyId: '',
    unitId: '',
    tenantId: '',
    amountCents: 0,
    method: 'CASH',
    referenceNumber: '',
    receivedAt: new Date().toISOString().split('T')[0],
    appliedTo: 'CURRENT_RENT',
    memo: '',
  });

  const handleChange = (field: keyof ManualPaymentFormData, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Record Manual Payment</h3>
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
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Amount (cents)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.amountCents}
              onChange={(e) => handleChange('amountCents', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Payment Method</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.method}
              onChange={(e) => handleChange('method', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
            >
              <option value="CASH">Cash</option>
              <option value="CHECK">Check</option>
              <option value="MONEY_ORDER">Money Order</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Date Received</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.receivedAt || ''}
              onChange={(e) => handleChange('receivedAt', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Reference #</label>
          <Input
            value={form.referenceNumber || ''}
            onChange={(e) => handleChange('referenceNumber', e.target.value)}
            placeholder="Check #, transaction ID, etc."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Applied To</label>
          <select
            value={form.appliedTo || 'CURRENT_RENT'}
            onChange={(e) => handleChange('appliedTo', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
          >
            <option value="CURRENT_RENT">Current Rent</option>
            <option value="ARREARS">Arrears</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="FEES">Fees</option>
            <option value="UTILITIES">Utilities</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Memo</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <textarea
              value={form.memo || ''}
              onChange={(e) => handleChange('memo', e.target.value)}
              className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              placeholder="Payment notes..."
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
          Record Payment
        </Button>
      </div>
    </form>
  );
}