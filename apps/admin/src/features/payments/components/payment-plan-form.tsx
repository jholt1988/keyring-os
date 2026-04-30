'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator,DollarSign,FileText,Save,X } from 'lucide-react';
import { useState } from 'react';

export interface PaymentPlanFormData {
  invoiceId: number;
  installments: number;
  amountPerInstallment: number;
  totalAmount: number;
}

interface PaymentPlanFormProps {
  initialData?: PaymentPlanFormData;
  invoiceOptions?: { id: number; amount: number; dueDate: string }[];
  onSave: (data: PaymentPlanFormData) => void;
  onCancel: () => void;
}

export function PaymentPlanForm({ 
  initialData, 
  invoiceOptions = [],
  onSave, 
  onCancel 
}: PaymentPlanFormProps) {
  const [form, setForm] = useState<PaymentPlanFormData>(initialData || {
    invoiceId: 0,
    installments: 3,
    amountPerInstallment: 0,
    totalAmount: 0,
  });

  const handleChange = (field: keyof PaymentPlanFormData, value: number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Create Payment Plan</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Invoice</label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.invoiceId || ''}
              onChange={(e) => handleChange('invoiceId', Number(e.target.value))}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
              required
            >
              <option value="">Select invoice</option>
              {invoiceOptions.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  #{inv.id} - ${inv.amount.toLocaleString()} due {inv.dueDate}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Installments</label>
          <div className="relative">
            <Calculator className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              min={1}
              max={60}
              value={form.installments}
              onChange={(e) => handleChange('installments', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
          <p className="text-[11px] text-[#64748B]">1-60 installments allowed</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Amount per Installment</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              step="0.01"
              value={form.amountPerInstallment}
              onChange={(e) => handleChange('amountPerInstallment', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Total Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              step="0.01"
              value={form.totalAmount}
              onChange={(e) => handleChange('totalAmount', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      {form.installments > 0 && form.amountPerInstallment > 0 && (
        <div className="mt-4 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 p-4">
          <p className="text-sm text-[#F8FAFC]">
            Total plan value: <span className="font-semibold">${(form.installments * form.amountPerInstallment).toLocaleString()}</span>
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            {form.installments} payments of ${form.amountPerInstallment.toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          Create Payment Plan
        </Button>
      </div>
    </form>
  );
}