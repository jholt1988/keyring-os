'use client';

import { useState } from 'react';
import { Link, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface RecipientViewFormData {
  returnUrl: string;
}

interface RecipientViewFormProps {
  onSave: (data: RecipientViewFormData) => void;
  onCancel: () => void;
}

export function RecipientViewForm({ onSave, onCancel }: RecipientViewFormProps) {
  const [form, setForm] = useState<RecipientViewFormData>({ returnUrl: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Recipient View</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Return URL</label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <Input value={form.returnUrl} onChange={(e) => setForm({ returnUrl: e.target.value })} placeholder="https://..." className="pl-10" required />
        </div>
        <p className="text-xs text-[#64748B]">URL to redirect after signing</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Link size={14} /> Generate View</Button>
      </div>
    </form>
  );
}