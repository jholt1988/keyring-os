'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock,Save,Target,XCircle } from 'lucide-react';
import { useState } from 'react';

export interface DecisionEventFormData {
  decisionId: string;
  actionTaken: string;
  timeToDecisionMs: number;
  confidenceAtTime?: number;
  outcome?: 'approved' | 'rejected' | 'deferred' | 'escalated';
}

interface DecisionEventFormProps {
  onSave: (data: DecisionEventFormData) => void;
  onCancel: () => void;
}

export function DecisionEventForm({ onSave, onCancel }: DecisionEventFormProps) {
  const [form, setForm] = useState({
    decisionId: '',
    actionTaken: '',
    timeToDecisionMs: 0,
  } as DecisionEventFormData);

  const handleChange = (field: keyof DecisionEventFormData, value: string | number | undefined) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={(e: any) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Track Decision Event</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><XCircle size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Decision ID</label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A99AD]" />
            <Input value={form.decisionId} onChange={(e: any) => handleChange('decisionId', e.target.value)} placeholder="Decision UUID" className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Outcome</label>
          <select value={form.outcome || ''} onChange={(e: any) => handleChange('outcome', e.target.value)} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="">Select outcome</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="deferred">Deferred</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Action Taken</label>
          <Input value={form.actionTaken} onChange={(e: any) => handleChange('actionTaken', e.target.value)} placeholder="e.g., approve_application" required />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Time to Decision (ms)</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A99AD]" />
            <Input type="number" value={form.timeToDecisionMs} onChange={(e: any) => handleChange('timeToDecisionMs', Number(e.target.value))} className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Confidence at Time</label>
          <Input type="number" step="0.01" min={0} max={1} value={form.confidenceAtTime || ''} onChange={(e: any) => handleChange('confidenceAtTime', e.target.value ? Number(e.target.value) : 0)} placeholder="0.0 - 1.0 (optional)" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Save size={14} /> Track Decision</Button>
      </div>
    </form>
  );
}