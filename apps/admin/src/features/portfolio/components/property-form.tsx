'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building,DollarSign,FileText,Globe,MapPin,Save,Tag,X } from 'lucide-react';
import { useState } from 'react';

export interface PropertyFormData {
  id?: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  propertyType?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  minRent?: number;
  maxRent?: number;
  yearBuilt?: number;
  tags?: string[];
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
    country: 'US',
    propertyType: 'single-family',
    description: '',
    latitude: undefined,
    longitude: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    minRent: undefined,
    maxRent: undefined,
    yearBuilt: undefined,
    tags: [],
  });
  const [tagInput, setTagInput] = useState((initialData?.tags || []).join(', '));

  const handleChange = (field: keyof PropertyFormData, value: string | number | string[] | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      tags: tagInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  const numberOrUndefined = (value: string) => (value === '' ? undefined : Number(value));

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
            value={form.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">State</label>
          <Input
            value={form.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="KS"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">ZIP Code</label>
          <Input
            value={form.zipCode || ''}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="67201"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Country</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.country || ''}
              onChange={(e) => handleChange('country', e.target.value)}
              className="pl-10"
              placeholder="US"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Property Type</label>
          <select
            value={form.propertyType || ''}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
          >
            <option value="single-family">Single Family</option>
            <option value="multi-family">Multi Family</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <textarea
              value={form.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              placeholder="Short description of the property..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Latitude</label>
          <Input
            type="number"
            step="any"
            value={form.latitude ?? ''}
            onChange={(e) => handleChange('latitude', numberOrUndefined(e.target.value))}
            placeholder="37.6872"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Longitude</label>
          <Input
            type="number"
            step="any"
            value={form.longitude ?? ''}
            onChange={(e) => handleChange('longitude', numberOrUndefined(e.target.value))}
            placeholder="-97.3301"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Bedrooms</label>
          <Input
            type="number"
            value={form.bedrooms ?? ''}
            onChange={(e) => handleChange('bedrooms', numberOrUndefined(e.target.value))}
            placeholder="2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Bathrooms</label>
          <Input
            type="number"
            step="0.5"
            value={form.bathrooms ?? ''}
            onChange={(e) => handleChange('bathrooms', numberOrUndefined(e.target.value))}
            placeholder="1.5"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Minimum Rent</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.minRent ?? ''}
              onChange={(e) => handleChange('minRent', numberOrUndefined(e.target.value))}
              className="pl-10"
              placeholder="1200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Maximum Rent</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              value={form.maxRent ?? ''}
              onChange={(e) => handleChange('maxRent', numberOrUndefined(e.target.value))}
              className="pl-10"
              placeholder="1800"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Year Built</label>
          <Input
            type="number"
            value={form.yearBuilt ?? ''}
            onChange={(e) => handleChange('yearBuilt', numberOrUndefined(e.target.value))}
            placeholder="1998"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Tags</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="pl-10"
              placeholder="luxury, pet-friendly, downtown"
            />
          </div>
          <p className="text-[11px] text-[#64748B]">Comma-separated tags</p>
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