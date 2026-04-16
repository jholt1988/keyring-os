'use client';

import { useState } from 'react';
import { CreditCard, Calendar, X, Save, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface PaymentMethodFormData {
  type: 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'DEBIT_CARD';
  provider: 'STRIPE' | 'SQUARE' | 'ACH' | 'OTHER';
  providerCustomerId?: string;
  providerPaymentMethodId?: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
}

interface PaymentMethodFormProps {
  initialData?: PaymentMethodFormData;
  onSave: (data: PaymentMethodFormData) => void;
  onCancel: () => void;
}

export function PaymentMethodForm({ initialData, onSave, onCancel }: PaymentMethodFormProps) {
  const [form, setForm] = useState<PaymentMethodFormData>(initialData || {
    type: 'CREDIT_CARD',
    provider: 'STRIPE',
    providerCustomerId: '',
    providerPaymentMethodId: '',
    last4: '',
    brand: '',
    expMonth: undefined,
    expYear: undefined,
  });

  const handleChange = (field: keyof PaymentMethodFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Add Payment Method</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Method Type</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value as PaymentMethodFormData['type'])}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
            >
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="BANK_ACCOUNT">Bank Account</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Provider</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.provider}
              onChange={(e) => handleChange('provider', e.target.value as PaymentMethodFormData['provider'])}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
            >
              <option value="STRIPE">Stripe</option>
              <option value="SQUARE">Square</option>
              <option value="ACH">ACH</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Last 4 Digits</label>
          <Input
            value={form.last4 || ''}
            onChange={(e) => handleChange('last4', e.target.value)}
            placeholder="1234"
            maxLength={4}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Brand</label>
          <Input
            value={form.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Visa, Mastercard, etc."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Expiry Month</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              min={1}
              max={12}
              value={form.expMonth ?? ''}
              onChange={(e) => handleChange('expMonth', e.target.value ? Number(e.target.value) : undefined)}
              className="pl-10"
              placeholder="12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Expiry Year</label>
          <Input
            type="number"
            min={2024}
            max={2050}
            value={form.expYear ?? ''}
            onChange={(e) => handleChange('expYear', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="2027"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]"> Provider Customer ID</label>
          <Input
            value={form.providerCustomerId || ''}
            onChange={(e) => handleChange('providerCustomerId', e.target.value)}
            placeholder="Stripe customer ID (optional)"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Provider Payment Method ID</label>
          <Input
            value={form.providerPaymentMethodId || ''}
            onChange={(e) => handleChange('providerPaymentMethodId', e.target.value)}
            placeholder="Stripe payment method ID (optional)"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          Add Payment Method
        </Button>
      </div>
    </form>
  );
}