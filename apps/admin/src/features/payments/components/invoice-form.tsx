'use client';

import { useState } from 'react';
import { FileText, DollarSign, Building, Calendar, X, Save, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface InvoiceFormData {
  id?: string;
  leaseId: string;
  amount: number;
  dueDate: string;
  description?: string;
  type?: 'rent' | 'deposit' | 'fee' | 'utility' | 'other';
}

interface InvoiceFormProps {
  initialData?: InvoiceFormData;
  leaseOptions?: { id: string; address: string }[];
  onSave: (data: InvoiceFormData) => void;
  onCancel: () => void;
}

export function InvoiceForm({ initialData, leaseOptions = [], onSave, onCancel }: InvoiceFormProps) {
  const [form, setForm] = useState<InvoiceFormData>(initialData || {
    leaseId: '',
    amount: 0,
    dueDate: '',
    description: '',
    type: 'rent',
  });

  const handleChange = (field: keyof InvoiceFormData, value: string | number | undefined) => {
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
          {initialData?.id ? 'Edit Invoice' : 'Create Invoice'}
        </h3>
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
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Due Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Type</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.type || 'rent'}
              onChange={(e) => handleChange('type', e.target.value as InvoiceFormData['type'])}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
            >
              <option value="rent">Rent</option>
              <option value="deposit">Deposit</option>
              <option value="fee">Fee</option>
              <option value="utility">Utility</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <textarea
              value={form.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              placeholder="Invoice description..."
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
          {initialData?.id ? 'Update' : 'Create'} Invoice
        </Button>
      </div>
    </form>
  );
}