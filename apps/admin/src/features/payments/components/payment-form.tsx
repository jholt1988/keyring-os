'use client';

import { useState } from 'react';
import { DollarSign, Calendar, Hash, Building, CreditCard, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface PaymentFormData {
  id?: string;
  amount: number;
  invoiceId?: number;
  leaseId: string;
  paymentDate?: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  externalId?: string;
  paymentMethodId?: number;
}

interface PaymentFormProps {
  initialData?: PaymentFormData;
  leaseOptions?: { id: string; address: string }[];
  onSave: (data: PaymentFormData) => void;
  onCancel: () => void;
}

export function PaymentForm({ 
  initialData, 
  leaseOptions = [], 
  onSave, 
  onCancel 
}: PaymentFormProps) {
  const [form, setForm] = useState<PaymentFormData>(initialData || {
    amount: 0,
    invoiceId: undefined,
    leaseId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    externalId: '',
    paymentMethodId: undefined,
  });

  const handleChange = (field: keyof PaymentFormData, value: string | number | undefined) => {
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
          {initialData?.id ? 'Edit Payment' : 'Record Payment'}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
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
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => handleChange('amount', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Invoice ID</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.invoiceId ?? ''}
              onChange={(e) => handleChange('invoiceId', e.target.value ? Number(e.target.value) : undefined)}
              className="pl-10"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Payment Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.paymentDate || ''}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Status</label>
          <select
            value={form.status || 'PENDING'}
            onChange={(e) => handleChange('status', e.target.value as PaymentFormData['status'])}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
          >
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Payment Method ID</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.paymentMethodId ?? ''}
              onChange={(e) => handleChange('paymentMethodId', e.target.value ? Number(e.target.value) : undefined)}
              className="pl-10"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">External ID</label>
          <Input
            value={form.externalId || ''}
            onChange={(e) => handleChange('externalId', e.target.value)}
            placeholder="Stripe payment ID, transaction ref, etc."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          {initialData?.id ? 'Update' : 'Record'} Payment
        </Button>
      </div>
    </form>
  );
}