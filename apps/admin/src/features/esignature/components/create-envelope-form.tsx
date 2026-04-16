'use client';

import { useState } from 'react';
import { FileText, Mail, User, Phone, Plus, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Recipient {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface CreateEnvelopeFormData {
  templateId: string;
  message?: string;
  recipients: Recipient[];
  provider?: 'DOCUSIGN' | 'SIGNNOW' | 'HELLOWORKS';
}

interface CreateEnvelopeFormProps {
  onSave: (data: CreateEnvelopeFormData) => void;
  onCancel: () => void;
}

export function CreateEnvelopeForm({ onSave, onCancel }: CreateEnvelopeFormProps) {
  const [form, setForm] = useState<CreateEnvelopeFormData>({
    templateId: '',
    message: '',
    recipients: [{ name: '', email: '', role: 'signer' }],
  });

  const addRecipient = () => {
    setForm((prev) => ({ ...prev, recipients: [...prev.recipients, { name: '', email: '', role: 'signer' }] }));
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...form.recipients];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, recipients: updated }));
  };

  const removeRecipient = (index: number) => {
    setForm((prev) => ({ ...prev, recipients: prev.recipients.filter((_, i) => i !== index) }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Create E-Signature Envelope</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Template ID</label>
          <Input value={form.templateId} onChange={(e) => setForm((prev) => ({ ...prev, templateId: e.target.value }))} placeholder="Template UUID" required />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Provider</label>
          <select value={form.provider || ''} onChange={(e) => setForm((prev) => ({ ...prev, provider: e.target.value as CreateEnvelopeFormData['provider'] }))} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="">Default</option>
            <option value="DOCUSIGN">DocuSign</option>
            <option value="SIGNNOW">SignNow</option>
            <option value="HELLOWORKS">HelloWorks</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Message</label>
          <textarea value={form.message || ''} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" placeholder="Optional message to recipients..." />
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Recipients</label>
            <Button type="button" variant="outline" size="sm" onClick={addRecipient}><Plus size={14} /> Add</Button>
          </div>
          
          {form.recipients.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-white/10 bg-[#0F1B31] p-3 md:grid-cols-4">
              <Input value={r.name} onChange={(e) => updateRecipient(i, 'name', e.target.value)} placeholder="Name" className="h-9" />
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#64748B]" />
                <Input value={r.email} onChange={(e) => updateRecipient(i, 'email', e.target.value)} placeholder="Email" className="h-9 pl-7" />
              </div>
              <Input value={r.role} onChange={(e) => updateRecipient(i, 'role', e.target.value)} placeholder="Role" className="h-9" />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeRecipient(i)}><X size={14} /></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={form.recipients.length === 0}><FileText size={14} /> Create Envelope</Button>
      </div>
    </form>
  );
}