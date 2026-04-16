'use client';

import { useState } from 'react';
import { User, Mail, Lock, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface UpdateUserFormData {
  email?: string;
  password?: string;
  role?: 'TENANT' | 'PROPERTY_MANAGER' | 'OWNER' | 'ADMIN';
}

interface UpdateUserFormProps {
  onSave: (data: UpdateUserFormData) => void;
  onCancel: () => void;
}

export function UpdateUserForm({ onSave, onCancel }: UpdateUserFormProps) {
  const [form, setForm] = useState<UpdateUserFormData>({});

  const handleChange = (field: keyof UpdateUserFormData, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Update User</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="email" value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="New email (optional)" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Role</label>
          <select value={form.role || ''} onChange={(e) => handleChange('role', e.target.value)} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="">Keep current</option>
            <option value="TENANT">Tenant</option>
            <option value="PROPERTY_MANAGER">Property Manager</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="password" value={form.password || ''} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min 8 characters (optional)" className="pl-10" minLength={8} />
          </div>
          <p className="text-xs text-[#64748B]">Leave empty to keep current password</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Save size={14} /> Update User</Button>
      </div>
    </form>
  );
}