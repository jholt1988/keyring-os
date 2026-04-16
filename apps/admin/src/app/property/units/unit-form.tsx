'use client';

import { useState } from 'react';
import { Home, Square, Bed, Bath, DollarSign, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface UnitFormData {
  id?: string;
  propertyId: string;
  propertyName?: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rent: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
}

interface UnitFormProps {
  initialData?: UnitFormData;
  propertyOptions?: { id: string; name: string }[];
  onSave: (data: UnitFormData) => void;
  onCancel: () => void;
}

export function UnitForm({ initialData, propertyOptions = [], onSave, onCancel }: UnitFormProps) {
  const [form, setForm] = useState<UnitFormData>(initialData || {
    propertyId: '',
    unitNumber: '',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 0,
    rent: 0,
    status: 'vacant',
  });

  const handleChange = (field: keyof UnitFormData, value: string | number) => {
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
          {initialData?.id ? 'Edit Unit' : 'Add Unit'}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Property</label>
          <select
            value={form.propertyId}
            onChange={(e) => handleChange('propertyId', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            required
          >
            <option value="">Select property</option>
            {propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Unit Number</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.unitNumber}
              onChange={(e) => handleChange('unitNumber', e.target.value)}
              className="pl-10"
              placeholder="e.g., 101, A1"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value as UnitFormData['status'])}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Bedrooms</label>
          <div className="relative">
            <Bed className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              min={0}
              max={10}
              value={form.bedrooms}
              onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Bathrooms</label>
          <div className="relative">
            <Bath className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={form.bathrooms}
              onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Square Feet</label>
          <div className="relative">
            <Square className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              min={0}
              value={form.sqft}
              onChange={(e) => handleChange('sqft', Number(e.target.value))}
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
              min={0}
              value={form.rent}
              onChange={(e) => handleChange('rent', Number(e.target.value))}
              className="pl-10"
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
          {initialData?.id ? 'Update' : 'Add'} Unit
        </Button>
      </div>
    </form>
  );
}