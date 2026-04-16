'use client';

import { useState } from 'react';
import { Building, MapPin, Home, Users, DollarSign, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface PropertyFormData {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'single-family' | 'multi-family' | 'apartment' | 'condo' | 'townhouse';
  units: number;
  status: 'active' | 'inactive' | 'pending-onboarding';
}

interface PropertyFormProps {
  initialData?: PropertyFormData;
  onSave: (data: PropertyFormData) => void;
  onCancel: () => void;
}

export function PropertyForm({ initialData, onSave, onCancel }: PropertyFormProps) {
  const [form, setForm] = useState<PropertyFormData>(initialData || {
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'single-family',
    units: 1,
    status: 'pending-onboarding',
  });

  const handleChange = (field: keyof PropertyFormData, value: string | number) => {
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
          {initialData?.id ? 'Edit Property' : 'Add Property'}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Property Name</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="pl-10"
              placeholder="e.g., Oak Street Apartments"
              required
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="pl-10"
              placeholder="123 Main Street"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">City</label>
          <Input
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">State</label>
          <Input
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="KS"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">ZIP Code</label>
          <Input
            value={form.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="67201"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Property Type</label>
          <select
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
          >
            <option value="single-family">Single Family</option>
            <option value="multi-family">Multi Family</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Number of Units</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              min={1}
              value={form.units}
              onChange={(e) => handleChange('units', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value as PropertyFormData['status'])}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
          >
            <option value="pending-onboarding">Pending Onboarding</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          {initialData?.id ? 'Update' : 'Add'} Property
        </Button>
      </div>
    </form>
  );
}