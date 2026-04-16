'use client';

import { useState } from 'react';
import { MessageSquare, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MaintenanceNoteFormData {
  body: string;
}

interface MaintenanceNoteFormProps {
  onSave: (data: MaintenanceNoteFormData) => void;
  onCancel: () => void;
}

export function MaintenanceNoteForm({ onSave, onCancel }: MaintenanceNoteFormProps) {
  const [form, setForm] = useState<MaintenanceNoteFormData>({
    body: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Add Maintenance Note</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Note</label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ body: e.target.value })}
            className="flex min-h-[120px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
            placeholder="Enter note details (max 1000 characters)..."
            maxLength={1000}
            required
          />
        </div>
        <p className="text-xs text-[#64748B]">{form.body.length}/1000 characters</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.body.trim()}>
          <Save size={14} />
          Add Note
        </Button>
      </div>
    </form>
  );
}