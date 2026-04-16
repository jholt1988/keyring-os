'use client';

import { useState } from 'react';
import { User, Phone, Mail, Calendar, X, Save, Heart, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface HouseholdMemberFormData {
  id?: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  isEmergency?: boolean;
  isOnLease?: boolean;
  dateOfBirth?: string;
  notes?: string;
}

interface HouseholdMemberFormProps {
  initialData?: HouseholdMemberFormData;
  onSave: (data: HouseholdMemberFormData) => void;
  onCancel: () => void;
}

export function HouseholdMemberForm({ initialData, onSave, onCancel }: HouseholdMemberFormProps) {
  const [form, setForm] = useState<HouseholdMemberFormData>(initialData || {
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isEmergency: false,
    isOnLease: false,
    dateOfBirth: '',
    notes: '',
  });

  const handleChange = (field: keyof HouseholdMemberFormData, value: string | boolean | undefined) => {
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
          {initialData?.id ? 'Edit Member' : 'Add Household Member'}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="pl-10"
              placeholder="Full name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Relationship</label>
          <div className="relative">
            <Heart className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.relationship}
              onChange={(e) => handleChange('relationship', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
              required
            >
              <option value="">Select</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="roommate">Roommate</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="tel"
              value={form.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="pl-10"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="email"
              value={form.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="pl-10"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#94A3B8]">
            <Shield size={14} /> On Lease
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isOnLease || false}
              onChange={(e) => handleChange('isOnLease', e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <span className="text-sm text-[#F8FAFC]">Listed on lease</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#94A3B8]">
            <Heart size={14} /> Emergency Contact
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isEmergency || false}
              onChange={(e) => handleChange('isEmergency', e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <span className="text-sm text-[#F8FAFC]">Emergency contact</span>
          </label>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Notes</label>
          <textarea
            value={form.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
            placeholder="Additional notes..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          {initialData?.id ? 'Update' : 'Add'} Member
        </Button>
      </div>
    </form>
  );
}