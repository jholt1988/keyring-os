'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save,Shield,Tag,User,X } from 'lucide-react';
import { useState } from 'react';

export interface TenantProfileFormData {
  id?: string;
  preferredName?: string;
  status?: string;
  tags?: string[];
  pets?: Array<{ name: string; type: string }>;
  vehicles?: Array<{ make: string; model: string; year: string; plate: string }>;
  idVerified?: boolean;
  notes?: string;
}

interface TenantProfileFormProps {
  initialData?: TenantProfileFormData;
  onSave: (data: TenantProfileFormData) => void;
  onCancel: () => void;
}

export function TenantProfileForm({ initialData, onSave, onCancel }: TenantProfileFormProps) {
  const [form, setForm] = useState<TenantProfileFormData>(initialData || {
    preferredName: '',
    status: '',
    tags: [],
    pets: [],
    vehicles: [],
    idVerified: false,
    notes: '',
  });

  const [tagInput, setTagInput] = useState(initialData?.tags?.join(', ') || '');

  const handleChange = (field: keyof TenantProfileFormData, value: string | boolean | string[] | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Edit Profile</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Preferred Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.preferredName || ''}
              onChange={(e) => handleChange('preferredName', e.target.value)}
              className="pl-10"
              placeholder="Nickname"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Status</label>
          <select
            value={form.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Tags</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="pl-10"
              placeholder="vip, sectional, preferred-tenant"
            />
          </div>
          <p className="text-[11px] text-[#64748B]">Comma-separated tags</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#94A3B8]">
            <Shield size={14} /> ID Verified
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.idVerified || false}
              onChange={(e) => handleChange('idVerified', e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <span className="text-sm text-[#F8FAFC]">Tenant identity verified</span>
          </label>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Notes</label>
          <textarea
            value={form.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
            placeholder="Additional notes about this tenant..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          Save Profile
        </Button>
      </div>
    </form>
  );
}