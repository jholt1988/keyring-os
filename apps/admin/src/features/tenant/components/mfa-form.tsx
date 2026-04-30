'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key,Save,Shield,ShieldOff,X } from 'lucide-react';
import { useState } from 'react';

export interface MFAFormData {
  action: 'activate' | 'disable';
  code?: string;
}

interface MFAFormProps {
  currentMfaEnabled?: boolean;
  onSave: (data: MFAFormData) => void;
  onCancel: () => void;
}

export function MFAForm({ currentMfaEnabled = false, onSave, onCancel }: MFAFormProps) {
  const [form, setForm] = useState<MFAFormData>({
    action: currentMfaEnabled ? 'disable' : 'activate',
    code: '',
  });

  const handleChange = (field: keyof MFAFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const isActivating = form.action === 'activate';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">
          {isActivating ? 'Enable' : 'Disable'} Two-Factor Authentication
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className={`rounded-lg ${isActivating ? 'bg-[#10B981]/10 border border-[#10B981]/30' : 'bg-[#F43F5E]/10 border border-[#F43F5E]/30'} p-4 mb-4`}>
        <div className="flex items-start gap-3">
          {isActivating ? (
            <Shield className="h-5 w-5 text-[#10B981] mt-0.5" />
          ) : (
            <ShieldOff className="h-5 w-5 text-[#F43F5E] mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">
              {isActivating ? 'Secure your account with 2FA' : 'Disable Two-Factor Authentication'}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              {isActivating 
                ? 'Add an extra layer of security by requiring a verification code in addition to your password.'
                : 'Warning: Disabling 2FA will make your account less secure.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Action</label>
        <select
          value={form.action}
          onChange={(e) => handleChange('action', e.target.value)}
          className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
        >
          <option value="activate">Enable 2FA</option>
          <option value="disable">Disable 2FA</option>
        </select>
      </div>

      {isActivating && (
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Verification Code</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.code || ''}
              onChange={(e) => handleChange('code', e.target.value)}
              className="pl-10"
              placeholder="Enter 6-digit code"
              maxLength={6}
              minLength={6}
              required
            />
          </div>
          <p className="text-[11px] text-[#64748B]">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>
      )}

      {!isActivating && (
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Confirmation Code (optional)</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={form.code || ''}
              onChange={(e) => handleChange('code', e.target.value)}
              className="pl-10"
              placeholder="Enter code to confirm disable"
              maxLength={6}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant={isActivating ? 'default' : 'destructive'}>
          <Save size={14} />
          {isActivating ? 'Enable 2FA' : 'Disable 2FA'}
        </Button>
      </div>
    </form>
  );
}