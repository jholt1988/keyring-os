'use client';

import { useState } from 'react';
import { CreditCard, DollarSign, ToggleLeft, ToggleRight, X, Save, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface AutopayConfigFormData {
  leaseId: string;
  paymentMethodId: number;
  active?: boolean;
  maxAmount?: number;
}

interface AutopayConfigFormProps {
  initialData?: AutopayConfigFormData;
  leaseOptions?: { id: string; address: string }[];
  paymentMethodOptions?: { id: number; last4: string; brand: string }[];
  onSave: (data: AutopayConfigFormData) => void;
  onCancel: () => void;
}

export function AutopayConfigForm({ 
  initialData, 
  leaseOptions = [], 
  paymentMethodOptions = [],
  onSave, 
  onCancel 
}: AutopayConfigFormProps) {
  const [form, setForm] = useState<AutopayConfigFormData>(initialData || {
    leaseId: '',
    paymentMethodId: 0,
    active: true,
    maxAmount: undefined,
  });

  const handleChange = (field: keyof AutopayConfigFormData, value: string | number | boolean | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Configure Autopay</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
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

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Payment Method</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.paymentMethodId || ''}
              onChange={(e) => handleChange('paymentMethodId', Number(e.target.value))}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
              required
            >
              <option value="">Select payment method</option>
              {paymentMethodOptions.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.brand} **** {pm.last4}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Max Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.maxAmount ?? ''}
              onChange={(e) => handleChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
              className="pl-10"
              placeholder="Optional limit"
            />
          </div>
          <p className="text-[11px] text-[#64748B]">Leave blank for no limit</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Status</label>
          <label 
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#0F1B31] p-3"
            onClick={() => handleChange('active', !form.active)}
          >
            {form.active ? (
              <ToggleRight className="h-6 w-6 text-[#10B981]" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-[#64748B]" />
            )}
            <span className="text-sm text-[#F8FAFC]">
              {form.active ? 'Autopay Enabled' : 'Autopay Disabled'}
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          Save Configuration
        </Button>
      </div>
    </form>
  );
}