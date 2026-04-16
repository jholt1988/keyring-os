'use client';

import { useState } from 'react';
import { Activity, MousePointer, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface UiEventFormData {
  eventType: 'decision_view' | 'action_click' | 'panel_expand' | 'context_switch' | 'application_step_view';
  elementId?: string;
  sessionDurationMs?: number;
  path?: string[];
}

interface UiEventFormProps {
  onSave: (data: UiEventFormData) => void;
  onCancel: () => void;
}

export function UiEventForm({ onSave, onCancel }: UiEventFormProps) {
  const [form, setForm] = useState<UiEventFormData>({
    eventType: 'decision_view',
    elementId: '',
    sessionDurationMs: 0,
  });

  const handleChange = (field: keyof UiEventFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Track UI Event</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Event Type</label>
          <select value={form.eventType} onChange={(e) => handleChange('eventType', e.target.value)} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="decision_view">Decision View</option>
            <option value="action_click">Action Click</option>
            <option value="panel_expand">Panel Expand</option>
            <option value="context_switch">Context Switch</option>
            <option value="application_step_view">Application Step View</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Element ID</label>
          <div className="relative">
            <MousePointer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input value={form.elementId || ''} onChange={(e) => handleChange('elementId', e.target.value)} placeholder="Optional element ID" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Session Duration (ms)</label>
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="number" value={form.sessionDurationMs || ''} onChange={(e) => handleChange('sessionDurationMs', Number(e.target.value))} placeholder="Optional" className="pl-10" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Save size={14} /> Track Event</Button>
      </div>
    </form>
  );
}