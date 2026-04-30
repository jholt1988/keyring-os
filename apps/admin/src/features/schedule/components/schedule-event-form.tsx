'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar,FileText,Flag,Home,User,X } from 'lucide-react';
import { useState } from 'react';

export interface ScheduleEventFormData {
  type: 'TOUR' | 'MOVE_IN' | 'MOVE_OUT' | 'LEASE_EXPIRATION' | 'LEASE_RENEWAL' | 'INSPECTION' | 'MAINTENANCE';
  title: string;
  date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
}

interface ScheduleEventFormProps {
  onSave: (data: ScheduleEventFormData) => void;
  onCancel: () => void;
}

export function ScheduleEventForm({ onSave, onCancel }: ScheduleEventFormProps) {
  const [form, setForm] = useState<ScheduleEventFormData>({
    type: 'TOUR',
    title: '',
    date: '',
    priority: 'MEDIUM',
  });

  const handleChange = (field: keyof ScheduleEventFormData, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Schedule Event</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Event Type</label>
          <select value={form.type} onChange={(e) => handleChange('type', e.target.value)} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="TOUR">Tour</option>
            <option value="MOVE_IN">Move In</option>
            <option value="MOVE_OUT">Move Out</option>
            <option value="LEASE_EXPIRATION">Lease Expiration</option>
            <option value="LEASE_RENEWAL">Lease Renewal</option>
            <option value="INSPECTION">Inspection</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Priority</label>
          <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Title</label>
          <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Event title" required />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="datetime-local" value={form.date} onChange={(e) => handleChange('date', e.target.value)} className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Property</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input value={form.propertyId || ''} onChange={(e) => handleChange('propertyId', e.target.value)} placeholder="Property ID (optional)" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Unit</label>
          <Input value={form.unitId || ''} onChange={(e) => handleChange('unitId', e.target.value)} placeholder="Unit ID (optional)" />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Tenant</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input value={form.tenantId || ''} onChange={(e) => handleChange('tenantId', e.target.value)} placeholder="Tenant ID (optional)" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <textarea value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" placeholder="Optional description..." />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Flag size={14} /> Create Event</Button>
      </div>
    </form>
  );
}