'use client';

import { useState } from 'react';
import { Wrench, MapPin, Home, Calendar, X, Save, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface MaintenanceRequestFormData {
  id?: string;
  title: string;
  description: string;
  priority?: 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
  propertyId?: string;
  unitId?: string;
  leaseId?: string;
  dueDate?: string;
  category?: string;
  assetId?: number;
}

interface MaintenanceRequestFormProps {
  initialData?: MaintenanceRequestFormData;
  propertyOptions?: { id: string; name: string }[];
  unitOptions?: { id: string; name: string }[];
  onSave: (data: MaintenanceRequestFormData) => void;
  onCancel: () => void;
}

export function MaintenanceRequestForm({ 
  initialData, 
  propertyOptions = [], 
  unitOptions = [],
  onSave, 
  onCancel 
}: MaintenanceRequestFormProps) {
  const [form, setForm] = useState<MaintenanceRequestFormData>(initialData || {
    title: '',
    description: '',
    priority: 'MEDIUM',
    propertyId: '',
    unitId: '',
    leaseId: '',
    dueDate: '',
    category: '',
    assetId: undefined,
  });

  const handleChange = (field: keyof MaintenanceRequestFormData, value: string | number | undefined) => {
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
          {initialData?.id ? 'Edit Request' : 'Create Maintenance Request'}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Title</label>
          <div className="relative">
            <Wrench className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="pl-10"
              placeholder="e.g., Leaking faucet in bathroom"
              required
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Priority</label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.priority || 'MEDIUM'}
              onChange={(e) => handleChange('priority', e.target.value as MaintenanceRequestFormData['priority'])}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Category</label>
          <select
            value={form.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6]"
          >
            <option value="">Select category</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="hvac">HVAC</option>
            <option value="appliance">Appliance</option>
            <option value="structural">Structural</option>
            <option value="pest">Pest Control</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Property</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.propertyId || ''}
              onChange={(e) => handleChange('propertyId', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
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
          <div className="relative">
            <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.unitId || ''}
              onChange={(e) => handleChange('unitId', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
            >
              <option value="">Select unit</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Due Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Asset ID</label>
          <Input
            type="number"
            value={form.assetId ?? ''}
            onChange={(e) => handleChange('assetId', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Optional asset reference"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          {initialData?.id ? 'Update' : 'Create'} Request
        </Button>
      </div>
    </form>
  );
}