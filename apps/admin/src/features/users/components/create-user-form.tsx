'use client';

import { useState } from 'react';
import { UserPlus, Mail, User, Lock, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface CreateUserFormData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'TENANT' | 'PROPERTY_MANAGER' | 'OWNER' | 'ADMIN';
}

interface CreateUserFormProps {
  onSave: (data: CreateUserFormData) => void;
  onCancel: () => void;
}

export function CreateUserForm({ onSave, onCancel }: CreateUserFormProps) {
  const [form, setForm] = useState<CreateUserFormData>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'TENANT',
  });

  const handleChange = (field: keyof CreateUserFormData, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Create User</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input value={form.username} onChange={(e) => handleChange('username', e.target.value)} placeholder="Username" className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="email@example.com" className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">First Name</label>
          <Input value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} placeholder="First name" required />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Last Name</label>
          <Input value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} placeholder="Last name" required />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min 8 characters" className="pl-10" minLength={8} required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Role</label>
          <select value={form.role || 'TENANT'} onChange={(e) => handleChange('role', e.target.value)} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="TENANT">Tenant</option>
            <option value="PROPERTY_MANAGER">Property Manager</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><UserPlus size={14} /> Create User</Button>
      </div>
    </form>
  );
}